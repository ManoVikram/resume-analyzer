package middleware

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lestrrat-go/httprc/v3"
	"github.com/lestrrat-go/jwx/v3/jwk"
	"github.com/lestrrat-go/jwx/v3/jwt"
)

var jwksCache *jwk.Cache

// InitJWKS initializes the JWKS cache with auto-refresh
func InitJWKS(ctx context.Context) error {
	// Step 1 - Get the Supabase JWKS URL
	jwksURL := os.Getenv("SUPABASE_JWKS_URL")
	if jwksURL == "" {
		return fmt.Errorf("SUPABASE_JWKS_URL is not set")
	}

	// Step 2 - Create auto-refreshing JWKS cache
	cache, err := jwk.NewCache(ctx, httprc.NewClient())
	if err != nil {
		return fmt.Errorf("Error while creating auto-refreshing JWKS cache: %v", err.Error())
	}

	// Step 3 - Register the Supabase JWKS URL to the cache
	if err := cache.Register(ctx, jwksURL); err != nil {
		return fmt.Errorf("Failed to register the Supabase JWKS URL to the cache: %v", err.Error())
	}

	// Step. 4 - Initial refresh to ensure everything works
	if _, err := cache.Refresh(ctx, jwksURL); err != nil {
		return fmt.Errorf("Failed to fetch JWKS: %v", err.Error())
	}

	jwksCache = cache

	return nil
}

// verifyJWT verifies the JWT using cached JWKS
func verifyJWT(ctx context.Context, tokenString string) (jwt.Token, error) {
	// Step 1 - Get the Supabase JWKS URL
	jwksURL := os.Getenv("SUPABASE_JWKS_URL")

	// Step 2 - Fetch JWKS from the cache (auto-refreshed)
	keyset, err := jwksCache.Lookup(ctx, jwksURL)
	if err != nil {
		return nil, fmt.Errorf("Failed to get JWKS:  %v", err.Error())
	}

	// Step 3 - Parse and verify the JWT
	// This automatically:
	// 1. Extracts the "kid" from JWT header
	// 2. Finds matching key in keyset
	// 3. Verifies signature using the public key
	// 4. Validates expiration, etc.
	token, err := jwt.Parse(
		[]byte(tokenString),
		jwt.WithKeySet(keyset),
		jwt.WithValidate(true),
		jwt.WithIssuer(fmt.Sprintf("https://%s.supabase.co/auth/v1", os.Getenv("SUPABASE_PROJECT_ID"))),
		jwt.WithAudience("authenticated"),
	)
	if err != nil {
		return nil, fmt.Errorf("Failed to verify the JWT token: %v", err.Error())
	}

	return token, nil
}

// AuthMiddleware verifies Supabase JWT tokens
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Step 1 - Get the Authorization header from the request
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Step 2 - Extract the token by removing 'Bearer'
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format. Use: Bearer <token>"})
			c.Abort()
			return
		}

		// Step 3 - Verify the JWT using the cached JWKS
		token, err := verifyJWT(c.Request.Context(), tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("Invalid JWT token: %v", err.Error())})
			c.Abort()
			return
		}

		// Step 4 - Extract user ID from the claims
		userID, ok := token.Subject()
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unable to get the user ID / Subject / sub from the JWT token"})
			c.Abort()
			return
		}
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: missing user ID"})
			c.Abort()
			return
		}

		// Step 5 - Store user ID in context
		c.Set("user_id", userID)

		// Step 6 - Store email in context (if available)
		var email string
		err = token.Get("email", &email)
		if err == nil {
			c.Set("email", email)
		}

		c.Next()
	}
}

package main

import (
	"log"
	"os"

	"github.com/ManoVikram/resume-analyzer/backend/api/client"
	"github.com/ManoVikram/resume-analyzer/backend/api/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	// Step 1 - Load the environment variables
	godotenv.Load("../../.env")

	grpcHost := os.Getenv("GRPC_HOST")
	grpcPort := os.Getenv("GRPC_PORT")
	httpHost := os.Getenv("HTTP_HOST")
	httpPort := os.Getenv("HTTP_PORT")

	if grpcHost == "" || grpcPort == "" || httpHost == "" || httpPort == "" {
		log.Fatalf("⚠️ One or more required environment variables are not set (GRPC_HOST=%q, GRPC_PORT=%q, HTTP_HOST=%q, HTTP_PORT=%q)", grpcHost, grpcPort, httpHost, httpPort)
		return
	}

	// Step 2 - Connect to the Python gRPC service & create the gRPC client
	grpcClient, connection, err := client.NewResumeAnalyzerClient(grpcHost, grpcPort)
	if err != nil {
		log.Fatalf("❌ Failed to connect to gRPC service at %s:%s - %v", grpcHost, grpcPort, err)
		return
	}
	defer connection.Close()
	log.Printf("✅ Successfully connected to gRPC service at %s:%s", grpcHost, grpcPort)

	// Step 3 - Initialize and set up the Gin HTTP server
	server := gin.Default()

	// Step 4 - Add CORS middleware
	server.Use(corsMiddleware())

	// Step 5 - Set not to trust any proxy servers
	server.SetTrustedProxies(nil)

	// Step 6 - Register routes
	routes.RegisterRoutes(server, grpcClient)

	// Step 7 - Start the Gin HTTP server
	log.Printf("🚀 Server running on %s:%s", httpHost, httpPort)
	log.Fatal(server.Run(":" + httpPort))
}

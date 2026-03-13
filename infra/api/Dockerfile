# Stage 1 - Build
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy go mod files first for better layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o server .


# Stage 2 - Runtime (distroless for minimal attack surface)
FROM gcr.io/distroless/static-debian12 AS runtime

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["/app/server"]
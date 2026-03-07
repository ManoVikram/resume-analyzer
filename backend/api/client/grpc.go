package client

import (
	pb "github.com/ManoVikram/resume-analyzer/backend/api/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func NewResumeAnalyzerClient(host string, port string) (pb.ResumeAnalyzerClient, *grpc.ClientConn, error) {
	address := host + ":" + port

	connection, err := grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, nil, err
	}

	client := pb.NewResumeAnalyzerClient(connection)
	
	return client, connection, nil
}
import os
import signal
from concurrent.futures import ThreadPoolExecutor

import grpc
from dotenv import load_dotenv
from resume_analyzer_servicer import ResumeAnalyzerServicer

from proto import resume_analyzer_pb2_grpc


class GracefulKiller:
    def __init__(self):
        self.kill_now = False
        signal.signal(signalnum=signal.SIGINT, handler=self.exit_gracefully)
        signal.signal(signalnum=signal.SIGTERM, handler=self.exit_gracefully)

    def exit_gracefully(self, signum, frame):
        self.kill_now = True

def serve():
    """
    Start the gRPC service
    """
    print("=" * 60)
    print("🚀 Starting Resume Analyzer AI Services")
    print("=" * 60)

    # Step 1 - Load the environment variables
    load_dotenv()
    assert os.getenv("ANTHROPIC_API_KEY"), "ANTHROPIC_API_KEY is not set in the environment variables."

    # Step 2 - Create the gRPC server with max message size set to 50MB
    MAX_MESSAGE_LENGTH = 50 * 1024 * 1024   # 50MB

    server = grpc.server(
        thread_pool=ThreadPoolExecutor(max_workers=10),
        options=[
            ("grpc.max_send_message_length", MAX_MESSAGE_LENGTH),
            ("grpc.max_receive_message_length", MAX_MESSAGE_LENGTH)
        ]
    )

    # Step 3 - Register the service to the server
    resume_analyzer_pb2_grpc.add_ResumeAnalyzerServicer_to_server(servicer=ResumeAnalyzerServicer(), server=server)

    # Step 4 - Bind the server to a port
    grpc_host = os.getenv("GRPC_HOST", "[::]")
    grpc_port = os.getenv("GRPC_PORT", "50051")
    server.add_insecure_port(f"{grpc_host}:{grpc_port}")

    # Step 5 - Start the server
    server.start()
    print(f"🚀 Python gRPC server is running!")
    print("\n" + "=" * 60)
    print(f"✨ All services running on {grpc_host}:{grpc_port}")
    print("=" * 60)
    print("\n📡 Available gRPC services:")
    print("  • ResumeAnalyzerService.AnalyzeResume")
    print("⏹️  Press Ctrl+C to stop\n")

    # Step 6 - Keep the server running and exit gracefully
    killer = GracefulKiller()

    try:
        while not killer.kill_now:
            signal.pause()
    except KeyboardInterrupt:
        pass

    print("🛑 Stopping server...")
    server.stop(grace=5)
    print("✅ Server stopped cleanly")

if __name__ == "__main__":
    serve()
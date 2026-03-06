# Resume Analyzer

Resume analyzer for developers targetting a remote job in the US with 0-2 YoE.

## Architecture
- Next.js (web)
- Go (API gateway)
- Python (AI microservices)
- gRPC (service communication)

## Install the Necessary Packages

All the necessary Python pacakges are added to the [requirements.txt](/backend/services/requirements.txt) file. Run the below command to install all the packages from this file.

```bash
pip3 install -r requirements.txt
```

The below commands will install the necessary Go gRPC packages.

```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

Add the installed Go protoc-gen-go package to PATH

```bash
export PATH="$PATH:$(go env GOPATH)/bin"
```

The below commands gets the necessary Go project dependencies

```bash
go get github.com/gin-gonic/gin
go get github.com/joho/godotenv
go get google.golang.org/grpc
go get google.golang.org/protobuf
```

## Generate the gRPC stub files

Run the below command from the /backend folder to generate the Python gRPC stub files.

```bash
python3 -m grpc_tools.protoc -I../proto --python_out=./services/proto --grpc_python_out=./services/proto ../proto/resume_analyzer.proto
```

Run the below command from the /backend folder to generate the mypy static type hint gRPC stub files (keeps Pylance from complaining).

```bash
python3 -m grpc_tools.protoc -I../proto --python_out=./services/proto --grpc_python_out=./services/proto --mypy_out=./services/proto ../proto/resume_analyzer.proto
```

Run the below command from the /backend folder to generate the Go gRPC files.

```bash
protoc --proto_path=../proto --go_out=./api/proto --go_opt=paths=source_relative --go-grpc_out=./api/proto --go-grpc_opt=paths=source_relative ../proto/resume_analyzer.proto
```

## Run the gRPC & Gin servers

```bash
python3 server.py
```

```bash
go run .
```
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
Check installations:
1. Check installations:
python --version
aws --version
 
2. Configure AWS CLI
Run:
aws configure
Enter values:
•	AWS Access Key ID → from IAM
•	AWS Secret Access Key → from IAM
•	Default region name → ap-south-1
•	Default output format → json

3. Create an SQS Queue
Create a queue named Sqs:
aws sqs create-queue --queue-name Sqs
Get the Queue URL:
aws sqs get-queue-url --queue-name Sqs
Save the Queue URL — you will need it.

4. Install Python Dependencies
Install boto3 (AWS SDK for Python):
python -m pip install boto3
Verify:
python -c "import boto3; print(boto3.__version__)"

5. Producer Application (Send Messages)
Create a file: producer.py
import boto3
import json
import uuid
import time

QUEUE_URL = "YOUR_SQS_QUEUE_URL"

sqs = boto3.client("sqs")

def send_message():
    message = {
        "id": str(uuid.uuid4()),
        "event": "order_created",
        "timestamp": int(time.time())
    }

    response = sqs.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps(message)
    )

    print("Message sent:", response["MessageId"])

if __name__ == "__main__":
    send_message()
Run:
python producer.py

6. Verify Message in Queue
Check message count:
aws sqs get-queue-attributes `
  --queue-url YOUR_SQS_QUEUE_URL `
  --attribute-names ApproximateNumberOfMessages
You should see messages in the queue.

7. Consumer Application (Receive Messages)
Create a file: consumer.py
import boto3
import json
import time

QUEUE_URL = "YOUR_SQS_QUEUE_URL"

sqs = boto3.client("sqs")

def consume():
    while True:
        response = sqs.receive_message(
            QueueUrl=QUEUE_URL,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20
        )

        messages = response.get("Messages", [])
        for msg in messages:
            body = json.loads(msg["Body"])
            print("Processing:", body)

            time.sleep(2)

            sqs.delete_message(
                QueueUrl=QUEUE_URL,
                ReceiptHandle=msg["ReceiptHandle"]
            )
            print("Message deleted")

if __name__ == "__main__":
    consume()
Run:
python consumer.py

8. Observe the Flow
1.	Run producer → message goes to SQS
2.	Run consumer → message processed and deleted
3.	Queue becomes empty



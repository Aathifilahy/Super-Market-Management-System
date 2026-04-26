Member 5 Order/cart API performance JMeter Cart/order stress test + report
Member 5 — Stress testing + report

Goal: Find when the system slows down.

Test:

100 users, then 200 users if safe

APIs:

Product listing

Add to cart

Place order



Metrics:

Response time increase

Failed requests

Maximum stable load

Tools Selected and Why

JMeter was used for load and stress testing because this project exposes HTTP APIs and JMeter is good for measuring response time, throughput, and error rate under multiple users.

How to Run JMeter Tests

Use the backend URL that is actually running. In the README it is documented as http://localhost:5224/api, but you also successfully ran it on http://localhost:5240/api during troubleshooting.

Step-by-step:

Start the backend API and make sure Swagger opens.
Open JMeter.
Create a Test Plan.
Add a Thread Group.
Add HTTP Request Defaults.
Set Server Name to localhost.
Set Port to 5224 or 5240, depending on your running backend.
Add HTTP Header Manager.
Add Content-Type: application/json.
Add Accept: application/json.
For protected endpoints, add Authorization: Bearer <JWT>.
Add HTTP Request samplers for:
GET /api/products
POST /api/cart/items
POST /api/orders
Add listeners like Summary Report and View Results Tree.
Run with 100 users, then increase to 200 users for stress testing.
Save the .jmx plan and generate the HTML report if needed.

Use JMeter for customer-heavy performance testing because customer traffic is the most realistic load source.
// import request from "supertest";

// import app from "../app";

// describe("GET /v1/get", () => {
//   it("Should respond with a 200 status code", (done) =>
//     request(app)
//       .get("/v1/get")
//       .expect("Content-Type", /json/)
//       .expect(200, done));

//   it("Should return expected response", async (done) => {
//     let response = { msg: "🚀 hello from v1 api" };
//     const { body } = await request(app).get("/v1/get").expect(200);
//     expect(body).toMatchObject(response);
//     done();
//   });
// });

// describe("POST /v1/post", () => {
//   it("Should respond with a 200 status code", (done) =>
//     request(app)
//       .post("/v1/post")
//       .expect("Content-Type", /json/)
//       .expect(200, done));

//   it("Should same request object on post", async (done) => {
//     let requestObject = {
//       user: {
//         name: "p-rk",
//       },
//     };
//     const { body } = await request(app)
//       .post("/v1/post")
//       .send(requestObject)
//       .expect(200);
//     expect(body).toMatchObject({ msg: requestObject });
//     done();
//   });
// });

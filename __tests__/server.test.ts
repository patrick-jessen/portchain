import supertest from "supertest";
import app from "../src/app";

describe("Server", () => {
  describe("Single page app", () => {
    it("serves the frontend", async () => {
      // Test that / serves index.html
      const indexHtml = await supertest(app)
        .get("/")
        .then((r) => {
          expect(r.status).toEqual(200);
          expect(r.get("content-type")).toEqual("text/html; charset=UTF-8");
          return r.text;
        });

      // Assets get a hash appended to their filename, so we need to extract the path
      const scriptPath = indexHtml.match(/<script.*src="([^"]*)/)?.[1];
      expect(typeof scriptPath).toBe("string");

      // Test that frontend assets are served
      const script = await supertest(app)
        .get(scriptPath!)
        .then((r) => {
          expect(r.status).toEqual(200);
          expect(r.get("content-type")).toEqual(
            "application/javascript; charset=UTF-8"
          );
        });

      // Test that 404 paths serve index.html
      await supertest(app)
        .get("/not-a-real-path")
        .then((r) => {
          expect(r.status).toEqual(200);
          expect(r.get("content-type")).toEqual("text/html; charset=UTF-8");
          expect(r.text).toEqual(indexHtml);
        });
    });
  });

  describe("Api routes", () => {
    describe("/api/analysis", () => {
      it("tests", async () => {
        await supertest(app)
          .get("/api/analysis")
          .then((r) => {
            expect(r.status).toEqual(200);
            expect(r.get("content-type")).toEqual(
              "application/json; charset=utf-8"
            );
            expect(Array.isArray(r.body)).toBe(true);
            expect(r.body.length).toBeGreaterThan(0);
          });
      });
    });
  });
});

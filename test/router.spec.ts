import * as chai from "chai";
import {Router} from "../lib/router/router";
import {TestResourceOne} from "./resource.one";

const router = Router.getInstance();
router.registerResource(new TestResourceOne());

describe("Router", () => {

    it("should handle direct use of callback", () => {
        return router.route(TestResourceOne.handlerMethod1Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
            chai.expect(arg2.body).not.to.be.null;
        });
    });

    it("should call handler with decorated params", () => {
        return router.route(TestResourceOne.handlerMethod1Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
            chai.expect(arg2).not.to.be.null;
            chai.expect(arg2.body).not.to.be.null;
            chai.expect(arg2.body).to.have.property("event");
            chai.expect(arg2.body).to.have.property("withArg");
            chai.expect(arg2.body).to.have.property("param");
            chai.expect(arg2.body.event).to.equal(TestResourceOne.handlerMethod1Data.event);
            chai.expect(arg2.body.withArg).to.equal("count man");
            chai.expect(arg2.body.param).to.equal("un,dos,tres");
        });
    });

    it("should handle GET", () => {
        return router.route(TestResourceOne.handlerMethod1Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
            chai.expect(arg2).not.to.be.null;
        });
    });

    it("should handle POST", () => {
        return router.route(TestResourceOne.handlerMethod2Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
        });
    });

    it("should handle BadRequestException", () => {
        return router.route(TestResourceOne.handlerMethod2Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
            chai.expect(arg2.statusCode).to.be.equal(400);
        });
    });

    it("should handle PUT", () => {
        return router.route(TestResourceOne.handlerMethod3Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
        });
    });

    it("should handle UnauthorizedException", () => {
        return router.route(TestResourceOne.handlerMethod3Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
            chai.expect(arg2.statusCode).to.be.equal(401);
        });
    });

    it("should handle DELETE ", () => {
        return router.route(TestResourceOne.handlerMethod4Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
        });
    });

    it("should handle return of response object - OK with no content ", () => {
        return router.route(TestResourceOne.handlerMethod4Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
            chai.expect(arg2.statusCode).to.be.equal(204);
        });
    });

    it("should handle ANY", () => {
        return router.route(TestResourceOne.handlerMethod5Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
        });
    });

    it("should handle return of response object - 301 redirect", () => {
        return router.route(TestResourceOne.handlerMethod5Data.event, null, (arg1, arg2) => {
            chai.expect(arg1).to.be.null;
            chai.expect(arg2.statusCode).to.be.equal(301);
            chai.expect(arg2.headers).not.to.be.null;
            chai.expect(arg2.headers.Location).to.be.equal("https://www.google.com");
        });
    });
});

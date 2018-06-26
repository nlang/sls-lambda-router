import {TestResourceOne} from "./resource.one";
import {IAuthorizer, Router} from "../src";
import {expect} from "chai";
import {APIGatewayEvent, Context} from "aws-lambda";

const router = Router.getInstance();
router.setDefaultAuthorizer({
    authorize(event: APIGatewayEvent, context: Context, handlerArgs?: any, endpointGroupOrId?: string): Promise<any> {
        if (endpointGroupOrId === "foo1") {
            return Promise.resolve(true);
        }
        throw new Error("Wrong endpointGroupOrId");
    },
} as IAuthorizer, true);
router.registerResource(new TestResourceOne());

describe("Router", () => {

    it("should handle direct use of callback", () => {
        return router.route(TestResourceOne.handlerMethod1Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
            expect(arg2.body).not.to.be.null;
        });
    });

    it("should call handler with decorated params", () => {
        return router.route(TestResourceOne.handlerMethod1Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
            expect(arg2).not.to.be.null;
            expect(arg2.body).not.to.be.null;
            expect(arg2.body).to.have.property("event");
            expect(arg2.body).to.have.property("withArg");
            expect(arg2.body).to.have.property("param");
            expect(arg2.body.event).to.equal(TestResourceOne.handlerMethod1Data.event);
            expect(arg2.body.withArg).to.equal("count man");
            expect(arg2.body.param).to.equal("un,dos,tres");
        });
    });

    it("should handle GET", () => {
        return router.route(TestResourceOne.handlerMethod1Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
            expect(arg2).not.to.be.null;
        });
    });

    it("should handle POST", () => {
        return router.route(TestResourceOne.handlerMethod2Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
        });
    });

    it("should handle BadRequestException", () => {
        return router.route(TestResourceOne.handlerMethod2Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
            expect(arg2.statusCode).to.be.equal(400);
        });
    });

    it("should handle PUT", () => {
        return router.route(TestResourceOne.handlerMethod3Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
        });
    });

    it("should handle UnauthorizedException", () => {
        return router.route(TestResourceOne.handlerMethod3Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
            expect(arg2.statusCode).to.be.equal(401);
        });
    });

    it("should handle DELETE ", () => {
        return router.route(TestResourceOne.handlerMethod4Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
        });
    });

    it("should handle return of response object - OK with no content ", () => {
        return router.route(TestResourceOne.handlerMethod4Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
            expect(arg2.statusCode).to.be.equal(204);
        });
    });

    it("should handle ANY", () => {
        return router.route(TestResourceOne.handlerMethod5Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
        });
    });

    it("should handle return of response object - 301 redirect", () => {
        return router.route(TestResourceOne.handlerMethod5Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
            expect(arg2.statusCode).to.be.equal(301);
            expect(arg2.headers).not.to.be.null;
            expect(arg2.headers.Location).to.be.equal("https://www.google.com");
        });
    });

    it("should call authorizer with endointGroupOrId", () => {
        return router.route(TestResourceOne.handlerMethod6Data.event, null, (arg1, arg2) => {
            expect(arg1).to.be.null;
            expect(arg2.statusCode).to.be.equal(204);
        });
    });
});

import {APIGatewayEvent, Callback} from "aws-lambda";
import {Helpers} from "./helper";
import {ANY, DELETE, GET, POST, PUT} from "../src/decorator/HttpMethodDecorator";
import {HttpEvent, JsonBody, LambdaCallback, PathParam} from "../src/decorator/ApiGatewayInvokeDecorator";
import {BadRequestException, ControlDecorator, Response, UnauthorizedException} from "../src";

export class TestResourceOne {

    public static handlerMethod1Data = {
        event: Helpers.createApiGwEvent("GET", "/test/resource/count%20man/some/un,dos,tres", null, "", null),
    };

    public static handlerMethod2Data = {
        event: Helpers.createApiGwEvent("POST", "/test/resource/dont/care/2", null, "", null ),
    };

    public static handlerMethod3Data = {
        event: Helpers.createApiGwEvent("PUT", "/test/resource/dont/care/3", null, "", null ),
    };

    public static handlerMethod4Data = {
        event: Helpers.createApiGwEvent("DELETE", "/test/resource/dont/care/4", null, "", null ),
    };

    public static handlerMethod5Data = {
        event: Helpers.createApiGwEvent("ANY", "/test/resource/dont/care/5", null, "", null ),
    };

    public static handlerMethod6Data = {
        event: Helpers.createApiGwEvent("DELETE", "/test/resource/restricted", null, "", null ),
    };

    @GET(["/test/resource/:with/some/:param"])
    public handlerMethod1(@HttpEvent event: APIGatewayEvent,
                          @PathParam("with") withArg: string,
                          @PathParam("param") param: string,
                          @LambdaCallback callback: Callback) {

        callback(null, {
            body: {
                event,
                withArg,
                param,
            },
            statusCode: 200,
        });
    }

    @POST(["/test/resource/dont/care/2"])
    public handlerMethod2(@JsonBody body: any) {
        throw new BadRequestException("So nicht");
    }

    @PUT(["/test/resource/dont/care/3"])
    public handlerMethod3(@JsonBody body: any) {
        throw new UnauthorizedException("Du nicht");
    }

    @DELETE(["/test/resource/dont/care/4"])
    public handlerMethod4(@JsonBody body: any) {
        return Response.ok();
    }

    @ANY(["/test/resource/dont/care/5"])
    public handlerMethod5(@JsonBody body: any) {
        return Response.redirect("https://www.google.com");
    }

    @DELETE(["/test/resource/restricted"])
    @ControlDecorator.Restricted(null, "foo1")
    public handlerMethod6(@HttpEvent event: APIGatewayEvent) {
        return Response.ok();
    }

}

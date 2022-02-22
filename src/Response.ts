import {APIGatewayProxyResult, Callback} from "aws-lambda";
import * as _ from "lodash";

export interface ICorsConfiguration {
    defaultEnabled: boolean;
    allowedOrigins: string[];
    allowCredentials: boolean;
    exposeHeaders: string[];
    allowHeaders: string[];
    requestOrigin?: string;
}

export class Response {

    public static ok(body?: any, contentType?: string): Response {
        if (body) {
            const response = new Response(200, body);
            if (contentType) {
                response.setContentType(contentType);
            }
            return response;
        }
        return new Response(204);
    }

    public static created(body?: any, contentType?: string) {
        const response = new Response(201, body);
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static redirect(url: string) {
        return new Response(301, null, {
            Location: url,
        });
    }

    public static badRequest(message?: string, contentType?: string): Response {
        const response = new Response(400, message || "Bad Request");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static unauthorized(message?: string, contentType?: string): Response {
        const response = new Response(401, message || "Unauthorized");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static forbidden(message?: string, contentType?: string): Response {
        const response = new Response(403, message || "Forbidden");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static notFound(message?: string, contentType?: string): Response {
        const response = new Response(404, message || "Not Found");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static serverError(message?: string, contentType?: string): Response {
        const response = new Response(500, message || "Internal Server Error");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static notImplemented(message?: string, contentType?: string): Response {
        const response = new Response(501, message || "Not Implemented");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static setCorsConfiguration(conf: ICorsConfiguration): void {
        Response.corsConfiguration = conf;
    }

    private static corsConfiguration: ICorsConfiguration = {
        allowCredentials: true,
        allowHeaders: ["Content-type"],
        allowedOrigins: ["(.*)"],
        defaultEnabled: false,
        exposeHeaders: [],
        requestOrigin: null,
    };

    private corsEnabled: boolean = null;
    private origin: string = null;

    constructor(public statusCode: number, public body?: any, public headers: { [key: string]: string } = {}) {
    }

    public enableCors(origin: string): Response {
        this.corsEnabled = true;
        this.origin = origin;
        return this;
    }

    public disableCors(): Response {
        this.corsEnabled = false;
        return this;
    }

    public setRequestOrigin(origin: string): Response {
        this.origin = origin;
        return this;
    }

    public setHeaders(headers: { [key: string]: string }): Response {
        for (const header of Object.keys(headers)) {
            this.setHeader(header.toLowerCase(), headers[header]);
        }
        return this;
    }

    public setHeader(key: string, value: string): Response {
        if (_.isString(key)) {
            if (_.isNull(value) || _.isUndefined(value)) {
                delete this.headers[key];
            } else {
                this.headers[key.toLowerCase()] = value;
            }
        }
        return this;
    }

    public getHeader(key: string): string {
        if (_.isString(key)) {
            return this.headers[key.toLowerCase()];
        }
        return null;
    }

    public setContentType(contentType: string): Response {
        this.setHeader("content-type", contentType);
        return this;
    }

    public getContentType(): string {
        return this.getHeader("content-type");
    }

    public getResponsePromise(contentType?: string): Promise<APIGatewayProxyResult> {
        let res;
        this.send((error, response) => {
            res = response;
        }, contentType);
        return Promise.resolve(res);
    }

    public send(callback: Callback, contentType?: string): void {
        if (!contentType) {
            contentType = this.getContentType();
        }
        if (!contentType) {

            if (_.isObject(this.body) || _.isArray(this.body)) {
                // assume json if body is array/object
                contentType = "application/json";
            } else {
                contentType = "text/plain";
            }
        }

        this.setContentType(contentType);
        switch (contentType.toUpperCase()) {
            case "application/json".toUpperCase():
                return this.sendJson(callback);

            default:
                return this.doSend(callback);
        }
    }

    public sendJson(callback: Callback): void {
        let json = this.body;
        if (_.isObject(this.body) || _.isArray(this.body)) {
            json = JSON.stringify(this.body);
        }
        return this.doSend(callback, json);
    }

    private doSend(callback: Callback, body?: any): void {
        try {
            this.applyCors();
            return callback(null, {
                body: (body ? body : this.body),
                headers: this.headers,
                statusCode: this.statusCode,
            });
        } catch (err) {
            this.setContentType("text/plain");
            return callback(null, {
                body: "Invalid origin",
                headers: this.headers,
                statusCode: 400,
            });
        }
    }

    private applyCors(): void {
        const corsCfg = Response.corsConfiguration;
        if (this.corsEnabled || (corsCfg && corsCfg.defaultEnabled)) {
            const origin = this.origin || corsCfg.requestOrigin || "";
            if (corsCfg.allowedOrigins) {
                for (const allowedOrigin of corsCfg.allowedOrigins) {
                    if (origin.match(allowedOrigin)) {
                        this.setHeader("Access-Control-Allow-Origin", origin);
                        this.setHeader("Access-Control-Allow-Credentials", corsCfg.allowCredentials ? "true" : "false");
                        this.setHeader("Access-Control-Expose-Headers", corsCfg.exposeHeaders.join(","));
                        this.setHeader("Access-Control-Allow-Headers", corsCfg.allowHeaders.join(","));
                        return;
                    }
                }
                throw new Error("Invalid origin");
            }
        }
    }
}

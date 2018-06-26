import {HTTPVerb} from "../HTTPVerb";
import {RouterResourceRegistry} from "../RouterResourceRegistry";

export class HttpMethodDecorator {

    public static ANY(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.ANY});
    }

    public static CONNECT(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.CONNECT});
    }

    public static DELETE(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.DELETE});
    }

    public static GET(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.GET});
    }

    public static HEAD(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.HEAD});
    }

    public static OPTIONS(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.OPTIONS});
    }

    public static PATCH(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.PATCH});
    }

    public static POST(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.POST});
    }

    public static PUT(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.PUT});
    }

    public static TRACE(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.TRACE});
    }

    private static register(this: { paths: string[], verb: HTTPVerb },
                            target: any,
                            propertyKey: string) {
        RouterResourceRegistry.registerHandler(this.verb, this.paths, target, propertyKey);
    }
}
export const ANY = HttpMethodDecorator.ANY;
export const CONNECT = HttpMethodDecorator.CONNECT;
export const DELETE = HttpMethodDecorator.DELETE;
export const GET = HttpMethodDecorator.GET;
export const HEAD = HttpMethodDecorator.HEAD;
export const OPTIONS = HttpMethodDecorator.OPTIONS;
export const PATCH = HttpMethodDecorator.PATCH;
export const POST = HttpMethodDecorator.POST;
export const PUT = HttpMethodDecorator.PUT;
export const TRACE = HttpMethodDecorator.TRACE;

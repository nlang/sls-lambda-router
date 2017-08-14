# Serverless Lambda Router
> A router for AWS Lambda serverless applications written in TypeScript that makes use
of `@Decorators` to register resource handlers and stuff.
  
## Usage
(more details to come)

```typescript
/** play.resource.ts **/
export class PlayResource {
  
  @GET(["/my/api/v1/play/:game"])
  public playGame(@HttpEvent event: APIGatewayEvent,
                  @PathParam("game") game: string): Promise<Response> {
    
    const game = Game.get(game);
    return game.start().then((res) => {
        return Response.ok(res, "application/json");
    }).catch ((err) => {
        throw new BadRequestException(err);
    });
}

/** handler.ts **/
class Appllication {

  public handler(event: APIGatewayEvent, context: Context, callback: Callback) {
    this.router.registerResource(new PlayResource());
    this.router.route(event, context, callback).then(() => {
        // some final stuff if everything went well
    }).catch((err) => {
        // some final stuff if something went wrong
    });
  }
}

```
# Serverless Lambda Router
> A router for AWS Lambda serverless applications written in TypeScript that makes use
of `@Decorators` to register resource handlers and stuff.

 ## IMPORTANT: This is work in progress...
 
## Usage
(more details to come)

```$xslt
/** play.resource.ts **/
export class PlayResource {
  
  <...*SNIP*...>
  
  @GET(["/my/api/v1/play/:game])
  public playGame(@HttpEvent event: APIGatewayEvent,
                  @PathParam("game") game: string,
                  @LambdaCallback callback: Callback): void {
    
    const game = Game.get(game);
    
    try {
      const fun = game.play();
        callback(null, {
            body: JSON.stringify(fun),
            statusCode: 200,
        });
    } catch (err) {
      throw new BadRequestException(err);
    }
}

/** handler.ts **/
class Appllication {

  <...*SNIP*...>

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
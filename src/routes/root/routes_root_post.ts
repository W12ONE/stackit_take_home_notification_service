export type RootPostReply = {
  code: number;
  header: {
    headerType: string;
    headerValue: string;
  };
  send: string;
};

export type RootPostRequest = {
  Type: string;
  Name: string;
  Description: string;
};

export const routesRootPost = async (
  request: RootPostRequest
): Promise<RootPostReply> => {
  // post stuff to Slack Webhook
  // https://docs.slack.dev/tools/slack-github-action/sending-techniques/sending-data-slack-incoming-webhook/
  // TODO: validate object actually matches expectations and normalise.

  if (request.Type === "Warning") {
    // TODO: Error Handling - try catch or await chain
    const bodyText = `${request.Type}: ${request.Name} \n ${request.Description}`;
    fetch(
      "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX", // <- example URL from Slack Docs
      {
        method: "POST",
        body: JSON.stringify({ text: bodyText }),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
    return {
      code: 200,
      header: {
        headerType: "Content-Type",
        headerValue: "application/json; charset=utf-8",
      },
      send: "OK",
    };
  } else {
    return {
      code: 200,
      header: {
        headerType: "Content-Type",
        headerValue: "application/json; charset=utf-8",
      },
      send: "Only notifications of type 'Warning' are forwarded",
    };
  }
};

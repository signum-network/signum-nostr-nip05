/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { DescriptorDataClient, URIResolver } from "@signumjs/standards";

interface NIP05ResponsePayload {
  names: {
    [key: string]: string;
  };
  relays?: {
    [key: string]: string[];
  };
}

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
}

const provideLedger = (nodeHost: string) => ({
  alias: {
    getAliasByName: async (aliasName: string, tld: string) => {
      const response = await fetch(
        `${nodeHost}/api?requestType=getAlias&aliasName=${aliasName}&tld=${tld}`
      );
      return response.json();
    },
  },
});

const ResponseOptions = {
  headers: {
    "content-type": "application/json;charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
  },
};

const NodeHost = "https://europe.signum.network";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const searchString = request.url.substring(request.url.indexOf("?"));
    const params = new URLSearchParams(searchString);
    const alias = params.get("name");

    if (!alias) {
      return new Response(null, {
        ...ResponseOptions,
        status: 400,
        statusText: "Parameter 'name' must be provided",
      });
    }
    try {
      const ledger = provideLedger(NodeHost);
      // @ts-ignore
      const client = new DescriptorDataClient(ledger);
      const { xnostr, xnsrel } = await client.getFromAlias(`${alias}:nostr`);

      if (!xnostr) {
        return new Response(null, {
          ...ResponseOptions,
          status: 404,
          statusText: `No nostr pubkey found - Alias requires field [xnostr]`,
        });
      }

      const nostrPubKey = xnostr as string;
      const nostrRelays = xnsrel as string[];
      let response: NIP05ResponsePayload = {
        names: {
          [alias]: nostrPubKey,
        },
      };
      if (nostrRelays) {
        response.relays = {
          [nostrPubKey]: nostrRelays,
        };
      }
      const responseJson = JSON.stringify(response);
      return new Response(responseJson, ResponseOptions);
    } catch (e: any) {
      return new Response(null, {
        ...ResponseOptions,
        status: 404,
      });
    }
  },
};

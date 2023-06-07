# signum-nostr-nip05

Decentralized NIP05 Alias Resolution Service

# How NIP05 verification works?

The [NIP05](https://github.com/nostr-protocol/nips/blob/master/05.md) specification of the nostr protocol describes a
standard how clients verify accounts. This is originally bound to conventional DNS-based domain ownership.
This requires for verifiable users to have

1. a domain
2. a webservice running

Example:

I own the domain `foodood.com`. So I need to add on my webserver, which I'm also running, a file called `nostr.json`
under the path `.well-known` and add a JSON description into it.

So, to verify I need a client like `https://coracle.social` and I enter my NIP05 address `johndoe@foodood.com` in the profile settings:
The client then looks under `https://foodood.com/.well-known/nostr.json?name=johndoe` and expects a specific answer:

```json
{
  "names": {
    "johndoe": "<mypublicknostrkey>"
  },
  "relays": {
    "<mypublicknostrkey>": ["wss://relay1.nostr.com", "wss://relay2.nostr.com"]
  }
}
```

For tech-savvy people this is straightforward but my Mom would struggle. (well, my Mom would not be the target audience of nostr - but this is another story)

# How it works with Signum?

Easiest way, if you don't have an Alias yet: https://nostrum.vercel.app/

> The dApp requires that you have a nostr account imported/created in the [XT Wallet](https://signum.network/wallet)

### Manual Process

You acquire an Alias in the namespace `nostr` - which costs you 50 SIGNA/year (about 8 US cent at the time of writing) for example
on [SignumSwap](https://signumswap.com/alias) or in the [Phoenix Wallet](https://phoenix-wallet.rocks). Then you edit this Alias and
add your (hexadecimal!!!) public nostr key and optional some relays. That's all!

The JSON payload has to look like this:

```json
{
  "vs": 1,
  "xnsrel": ["wss://relay.damus.io", "wss://relay.nostr.band"],
  "xnostr": "<your nostr public key IN HEXADECIMAL FORM>"
}
```

After the transaction is settled in the network (after about 240 seconds)
you can verify you nostr account as usual.

# But what's the tech magic behind this?!

The Signum Network allows users to own updatable data containers, called Aliases. All done in a decentralized manner
with no intermediaries like ICANN or banks. These Aliases can be updated by the owner (and even traded) whenever (s)he needs.
With the help of the [Structured Data Format (SRC44)](https://github.com/signum-network/SIPs/blob/master/SIP/sip-44.md) a user
adds a nostr public key to th pre-defined field `xnostr` (and `xnsrel` for relays).
The Signum Network runs a service that delegates `NIP05` addresses like `johndoe@signum.network` to the Alias `johndoe` and
looks for the `xnostr` field. If existent a `NIP05` compliant content is being returned to the requesting client.

Once you own that Alias, no one can take it away from you: **Your keys, Your Alias**

# Development

This project is for Cloudworker Functions on Cloudflare.

To run this locally, type: `npm run dev`

```bash
 ⛅️ wrangler 2.17.0
--------------------
⬣ Listening at http://0.0.0.0:8787
- http://127.0.0.1:8787
- http://192.168.1.20:8787
Total Upload: 31.32 KiB / gzip: 6.37 KiB
⎔ Starting a local server...
⎔ Shutting down local server.
⎔ Starting a local server...
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ [b] open a browser, [d] open Devtools, [l] turn off local mode, [c] clear console, [x] to exit                                                                                                                                                                                                                │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

> You can run locally by typing `l` if you want to debug locally

# Deploy

Use `wrangler publish`

> This repo uses github actions... each push to main branch triggers a deploy automatically

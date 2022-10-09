# Deployments:

- GCP: https://reader.doliver.net (https://tw-reader-erpc3bdnvq-uw.a.run.app)
- Netlify: https://tw-reader.netlify.com/
- Surge: https://tw-reader.surge.sh/

## GCP | [Dashboard](https://console.cloud.google.com/home/dashboard?project=treader)

GCP hosts the back end server and connects to DB at [Mongo Atlas](https://cloud.mongodb.com/v2/5f792075b299ca0efb0e2cfc#clusters)

Build and deployment are done from the GCP console:

1. Login to dashboard and open a cloud shell
1. there is a local branch on that machine called `gcp-deployment`. The proper environment variables are in the Dockerfile in this branch.
1. pull origin/master into that branch `git pull origin master`
1. Build a new image with `npm run gcp-build`
1. Deploy the image with `npm run gcp-deploy`
1. Note: don't push anything back to master from here

## Netlify | [Dashboard](https://app.netlify.com/sites/tw-reader/overview)

- serves react app only and connects to the GCP back end
- connected to github repo, does auto build & deploy on commits to master
- env vars are defined in netlify.toml

## Surge

Surge hosts only the React front end of the app and connects to the back end at GCP. This is an alternative to Netlify with a simple push from command line. For any changes to the React app, run a new build and push it to Surge:

1. Make sure the following environment variable is set before building: `export REACT_APP_URL_BASE=https://reader.doliver.net`
2. Run the build from the react-app/ directory: `npm run build`
3. Deploy to Surge from the react-app/ directory: `npm run deploy-surge`

Note: If the app is unable to load tweets, view the network traffic to make sure it's hitting
the reader.doliver.net server. If it's trying to hit surge.sh then the environment variable
was probably not set in #1 _before_ the app was built.

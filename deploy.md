# Deployments:

- Heroku: https://tw-reader.herokuapp.com/
- GCP: https://reader.doliver.net (https://tw-reader-erpc3bdnvq-uc.a.run.app)
- Netlify: https://tw-reader.netlify.com/
- Surge: https://tw-reader.surge.sh/

## Heroku

- [Dashboard](https://dashboard.heroku.com/apps/tw-reader)
- serves both static and react apps
- This app is on free tier dyno, will take ~15 seconds to spin up from idle
- connected to github repo, does auto build & deploy on commits to master
  - React hosted at `/`
  - Static at `/main`

## GCP

GCP hosts the back end server and connects to DB at [MLab](https://mlab.com/databases/reader-gcp).

- [Dashboard](https://console.cloud.google.com/home/dashboard?project=treader)

Build and deployment are done from the GCP console:

1. Login to dashboard and open a cloud shell
1. there is a local branch on that machine called `gcp-deployment`. The proper environment variables are in the Dockerfile in this branch.
1. pull origin/master into that branch `git pull origin master`
1. Build a new image with `npm run gcp-build`
1. Deploy the image with `npm run gcp-deploy`
1. Note: don't push anything back to master from here

## Netlify

- [Dashboard](https://app.netlify.com/sites/tw-reader/overview)
- serves react app only
- connected to github repo, does auto build & deploy on commits to master
- env vars are defined in netlify.toml

## Surge

Surge hosts only the React front end of the app. This is an alternative to Netlify with a simple push from command line. For any changes to the React app, run a new build and push it to Surge:

1. Make sure the following environment variable is set before building: `REACT_APP_URL_BASE=https://reader.doliver.net`
2. Run the build from the react-app/ directory: `npm run build`
3. Deploy to Surge from the react-app/ directory: `npm run deploy-surge`

Note: If the app is unable to load tweets, view the network traffic to make sure it's hitting
the reader.doliver.net server. If it's trying to hit surge.sh then the environment variable
was probably not set in #1 _before_ the app was built.

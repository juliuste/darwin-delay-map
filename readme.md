# darwin-delay-map

Show network disruptions from [Darwin Push Port](https://wiki.openraildata.com/index.php/Darwin:Push_Port) on a map over time. Also see the [data preparation repo](https://github.com/juliuste/parse-darwin-push-port). Written at [HackTrain at InnoTrans 2018](https://www.eventbrite.com/e/hacktrain-hackathon-powered-by-innotrans-tickets-43135838454). **See the [DEMO](https://juliuste.github.io/darwin-delay-map/)**. *Work in progress, currently showing one day in May 2018, not responsive.*

To change the input data file, simply alter this line in `index.js` to any file present in `data`:

```js
let rawData = require('./data/0513.json')
```

…and don't forget to run `npm run build` afterwards!

[![license](https://img.shields.io/github/license/juliuste/darwin-delay-map.svg?style=flat)](license)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Contributing

If you found a bug or want to propose a feature, feel free to visit [the issues page](https://github.com/juliuste/darwin-delay-map/issues).

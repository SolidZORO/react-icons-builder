# react-icons-builder

build custom `react-icons` svg icons collection.


## Installation

```sh
yarn add -D react-icons-builder
```


## Usage

1. copy `*.svg` files to `src/icons` (example path)

2. create a index.js to `src/icons`

```javascript
const path = require('path');

module.exports = {
  icons: [
    {
      id: 'li',
      name: 'LocalIcon',
      contents: [
        {
          files: path.resolve(__dirname, './*.svg'),
          formatter: (name) => `Li${name}`,
        },
      ],
      license: 'MIT',
      projectUrl: 'https://li.local',
      licenseUrl: 'https://li.local',
    },
  ],
};
```


3. add a script to project package.json `scripts`:

```
"scripts": {
  "build-icons": "react-icons-builder --src ./src/icons --dist ./src/libs/react-icons-ext",
},
```

4. yarn build-icons

5. use for code:

```tsx
import { RiAbc } from 'react-icons/ri';
import { LiXzy } from '@/libs/react-icons-ext/li'; // `@` aliase src dir

export default () => {
  return (
    <div>
      <RiAbc color="red" />
      <LiXzy color="blue" />
    </div>
  );
};
```


## License

© [MIT](./LICENSE)




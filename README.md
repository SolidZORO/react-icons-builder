# react-icons-builder


## Features

- Build customized svg file to `react-icons`


## Installation

```sh
yarn add -D react-icons-builder
```


## Usage

1. copy `*.svg` files to `src/assets/images/icons` (this just demo path)

2. create a index.js to `src/assets/images/icons`

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
  "build-icons": "react-icons-builder --src ./src/assets/images/icons --dist ./src/libs/react-icons-ext",
},
```

4. yarn build-icons

5. use for code:

```tsx
import { RiAbc } from 'react-icons/ri';
import { LiXzy } from '@/src/libs/react-icons-ext/li'; // 本地扩展

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




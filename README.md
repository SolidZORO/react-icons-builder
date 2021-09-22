file fork by `https://github.com/react-icons/react-icons/blob/master/packages/react-icons/scripts/logics.js`

node ./build.js --src ./icons1 --dist ./dist

```tsx
import { RiTvLine } from 'react-icons/ri'; // 官方库
import { SsTvLine } from '@/assets/react-icons-ext/ss'; // 本地扩展

export default () => {
  return (
    <div>
      <RiTvLine color="red" />
      <SsTvLine color="red" />
    </div>
  );
};
```

注意：

生成的 icon 文件需加入 git 版本一起提交，未来可考虑独立 npm 包。

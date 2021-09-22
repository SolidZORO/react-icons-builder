const path = require('path');

module.exports = {
  icons: [
    {
      id: 'ti',
      name: 'TestIcon',
      contents: [
        {
          files: path.resolve(__dirname, './*.svg'),
          formatter: (name) => `Ti${name}`,
        },
      ],
      license: 'MIT',
      projectUrl: 'https://ti.local',
      licenseUrl: 'https://ti.local',
    },
  ],
};

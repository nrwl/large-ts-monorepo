/* eslint-disable */
export default {
   displayName: 'lib-42',
   preset: '../../../jest.preset.js',
   testEnvironment: 'node',
   transform: {
      '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
   },
   moduleFileExtensions: ['ts', 'js', 'html'],
   coverageDirectory: '../../../coverage/packages/libs/lib42',
};

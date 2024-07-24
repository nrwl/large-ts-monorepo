/* eslint-disable */
export default {
   displayName: 'lib-235',
   preset: '../../../jest.preset.js',
   testEnvironment: 'node',
   transform: {
      '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
   },
   moduleFileExtensions: ['ts', 'js', 'html'],
   coverageDirectory: '../../../coverage/packages/libs-3/lib235',
};

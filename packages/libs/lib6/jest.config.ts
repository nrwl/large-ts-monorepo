/* eslint-disable */
export default {
   displayName: 'lib-6',
   preset: '../../../jest.preset.js',
   testEnvironment: 'node',
   transform: {
      '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
   },
   moduleFileExtensions: ['ts', 'js', 'html'],
   coverageDirectory: '../../../coverage/packages/libs/lib6',
};

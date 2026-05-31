import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const commonPlugins = [
  resolve(),
  typescript(),
  production && terser({ ecma: 2020 }),
];

export default [
  {
    input: "src/alarm-overview.ts",
    output: {
      file: "../custom_components/scada_alarm_manager/frontend/alarm-overview.js",
      format: "es",
      sourcemap: !production,
    },
    plugins: commonPlugins,
  },
  {
    input: "src/alarm-banner.ts",
    output: {
      file: "../custom_components/scada_alarm_manager/frontend/alarm-banner.js",
      format: "es",
      sourcemap: !production,
    },
    plugins: commonPlugins,
  },
];

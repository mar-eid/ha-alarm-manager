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
    input: "src/alarm-center-panel.ts",
    output: {
      file: "../custom_components/scada_alarm_manager/frontend/alarm-center-panel.js",
      format: "es",
      sourcemap: !production,
    },
    plugins: commonPlugins,
  },
  {
    input: "src/alarm-card.ts",
    output: {
      file: "../custom_components/scada_alarm_manager/frontend/alarm-card.js",
      format: "es",
      sourcemap: !production,
    },
    plugins: commonPlugins,
  },
  {
    input: "src/alarm-center-card.ts",
    output: {
      file: "../custom_components/scada_alarm_manager/frontend/alarm-center-card.js",
      format: "es",
      sourcemap: !production,
    },
    plugins: commonPlugins,
  },
  {
    input: "src/alarm-dashboard.ts",
    output: {
      file: "../custom_components/scada_alarm_manager/frontend/alarm-dashboard.js",
      format: "es",
      sourcemap: !production,
    },
    plugins: commonPlugins,
  },
];

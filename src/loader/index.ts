import { loadConfig } from 'c12';
import { resolve } from "pathe";
import type { LoadConfigOptions, ConfigLayer } from 'c12'
import type { BuildConfig } from "../types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LoadUnbuildConfigOptions extends LoadConfigOptions<BuildConfig> {}
type UnbuildConfigLayer = ConfigLayer<BuildConfig & {
  rootDir: string
}>
export interface UnbuildConfigOptions extends BuildConfig {
  _layers: UnbuildConfigLayer[]
}

/**
 * Load build config using c12 under the hood
 *
 * @param options - build config options
 */
export async function loadUnbuildConfig(opts: LoadUnbuildConfigOptions): Promise<UnbuildConfigOptions> {
  const { cwd, config, layers = [] } = await loadConfig<BuildConfig>({
    name: 'build',
    rcFile: false,
    dotenv: false,
    globalRc: false,
    ...opts,
  });

  console.log(layers)

  const buildConfig = config!;
  buildConfig.rootDir = buildConfig.rootDir || cwd;

  // Resolve `rootDir`
  for (const layer of layers) {
    layer.config = layer.config || {};
    layer.config.rootDir = resolve(layer.config.rootDir! ?? layer.cwd);
  }

  const _layers: any = layers.map((l) => l.configFile);
  (buildConfig as any)._layers = _layers;

  // Ensure at least one layer remains
  if (_layers.length === 0) {
    _layers.push({
      cwd,
      config: {
        rootDir: cwd
      }
    })
  }

  return buildConfig as UnbuildConfigOptions;
}

import type { Plugin, RenderedChunk } from "rollup";
import { findExports, findStaticImports, parseStaticImport } from "mlly";
import type { ESMExport, ParsedStaticImport } from "mlly";
import MagicString from "magic-string";
import type { BuildContext } from "../../../types";

export function cjsPlugin(_opts?: any): Plugin {
  return {
    name: "unbuild-cjs",
    renderChunk(code, _chunk, opts) {
      if (opts.format === "es") {
        return CJSToESM(code);
      }
      return null;
    },
  } as Plugin;
}

export function fixDefaultCJSExportsPlugin(ctx: BuildContext): Plugin {
  return {
    name: "unbuild-fix-cjs-export-type",
    renderChunk(code, info) {
      if (
        info.type !== "chunk" ||
        !(
          info.fileName.endsWith(".d.ts") || info.fileName.endsWith(".d.cts")
        ) ||
        !info.isEntry ||
        !info.exports?.length ||
        !info.exports.includes("default")
      ) {
        return;
      }

      return pathDefaultCJSExportsPlugin(code, info, ctx);
    },
  } as Plugin;
}

const CJSyntaxRe = /__filename|__dirname|require\(|require\.resolve\(/;

const CJSShim = `

// -- Unbuild CommonJS Shims --
import __cjs_url__ from 'url';
import __cjs_path__ from 'path';
import __cjs_mod__ from 'module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
`;

// Shim __dirname, __filename and require
function CJSToESM(code: string): { code: string; map: any } | null {
  if (code.includes(CJSShim) || !CJSyntaxRe.test(code)) {
    return null;
  }

  const lastESMImport = findStaticImports(code).pop();
  const indexToAppend = lastESMImport ? lastESMImport.end : 0;
  const s = new MagicString(code);
  s.appendRight(indexToAppend, CJSShim);

  return {
    code: s.toString(),
    map: s.generateMap(),
  };
}

interface ParsedExports {
  defaultExport: ESMExport;
  defaultAlias: string;
  exports: string[];
}

function extractExports(
  code: string,
  info: RenderedChunk,
  ctx: BuildContext,
): ParsedExports | undefined {
  const defaultExport = findExports(code).find((e) =>
    e.names.includes("default"),
  );

  if (!defaultExport) {
    ctx.warnings.add(
      `No default export found in ${info.fileName}, it contains default export but cannot be parsed.`,
    );
    return;
  }

  const match = defaultExport.code.match(/export\s*\{([^}]*)\}/);
  if (!match?.length) {
    ctx.warnings.add(
      `No default export found in ${info.fileName}, it contains default export but cannot be parsed.`,
    );
    return;
  }

  let defaultAlias: string | undefined;
  const exportsEntries: string[] = [];
  for (const exp of match[1].split(",").map((e) => e.trim())) {
    if (exp === "default") {
      defaultAlias = exp;
      continue;
    }
    const m = exp.match(/\s*as\s+default\s*/);
    if (m) {
      defaultAlias = exp.replace(m[0], "");
    } else {
      exportsEntries.push(exp);
    }
  }

  if (!defaultAlias) {
    ctx.warnings.add(
      `No default export found in ${info.fileName}, it contains default export but cannot be parsed.`,
    );
    return;
  }

  return {
    defaultExport,
    defaultAlias,
    exports: exportsEntries,
  };
}

// export { default } from "magic-string";
// or
// import MagicString from 'magic-string';
// export default MagicString;
function handleDefaultCJSExportAsDefault(
  code: string,
  { defaultExport, exports }: ParsedExports,
  imports: ParsedStaticImport[],
  defaultImport?: ParsedStaticImport,
): string | undefined {
  if (defaultImport) {
    return exports.length === 0
      ? code.replace(
          defaultExport.code,
          `export = ${defaultImport.defaultImport}`,
        )
      : code.replace(
          defaultExport.code,
          `export = ${defaultImport.defaultImport};\nexport { ${exports.join(", ")} } from '${defaultExport.specifier}'`,
        );
  } else {
    const magicString = new MagicString(code);
    // add the import after last import in the code
    const lastImportPosition =
      imports.length > 0 ? imports.at(-1)?.end || 0 : 0;
    if (lastImportPosition > 0) {
      magicString.appendRight(
        lastImportPosition,
        `\nimport _default from '${defaultExport.specifier}';\n`,
      );
    } else {
      magicString.prepend(
        `import _default from '${defaultExport.specifier}';\n`,
      );
    }

    return exports.length > 0
      ? magicString
          .replace(
            defaultExport.code,
            `export = _default;\nexport { ${exports.join(", ")} } from '${defaultExport.specifier}'`,
          )
          .toString()
      : magicString.replace(defaultExport.code, "export = _default").toString();
  }
}

// export { resolve as default } from "pathe";
function handleDefaultNamedCJSExport(
  code: string,
  info: RenderedChunk,
  parsedExports: ParsedExports,
  imports: ParsedStaticImport[],
  ctx: BuildContext,
  defaultImport?: ParsedStaticImport | undefined,
): string | undefined {
  const { defaultAlias, defaultExport, exports } = parsedExports;

  // export { default } from "magic-string";
  if (defaultAlias === "default") {
    // mlly parsing with _type='named', but always as default
    // {
    //   type: 'default',
    //   exports: ' default',
    //   specifier: 'magic-string',
    //   names: [ 'default' ],
    //   name: 'default',
    //   _type: 'named'
    // }

    // doesn't matter the type, it's always default (maybe mlly bug?)

    // export { resolve as default } from 'pathe';
    // {
    //   type: 'default',
    //   exports: ' resolve as default',
    //   specifier: 'pathe',
    //   names: [ 'default' ],
    //   name: 'default',
    //   _type: 'named'
    // }

    // prevent calling handleDefaultCJSExportAsDefault
    // since we don't have the import name for the default export
    // defaultImport should be undefined
    if (defaultImport && !defaultImport.defaultImport) {
      ctx.warnings.add(
        `Cannot parse default export name from ${defaultImport.specifier} import at ${info.fileName}!.`,
      );
      return undefined;
    }

    return handleDefaultCJSExportAsDefault(
      code,
      parsedExports,
      imports,
      defaultImport,
    );
  }

  if (defaultImport) {
    // we need to add the named import to the default import
    const namedExports = defaultImport.namedImports;
    if (namedExports?.[defaultAlias] === defaultAlias) {
      return exports.length === 0
        ? code.replace(defaultExport.code, `export = ${defaultAlias}`)
        : code.replace(
            defaultExport.code,
            `export = ${defaultAlias};\nexport { ${exports.join(", ")} }`,
          );
    } else {
      ctx.warnings.add(
        `Cannot parse "${defaultAlias}" named export from ${defaultImport.specifier} import at ${info.fileName}!.`,
      );
      return undefined;
    }
  }

  // we need to add the import
  const magicString = new MagicString(code);
  // add the import after last import in the code
  const lastImportPosition = imports.length > 0 ? imports.at(-1)?.end || 0 : 0;
  if (lastImportPosition > 0) {
    magicString.appendRight(
      lastImportPosition,
      `\nimport { ${defaultAlias} } from '${defaultExport.specifier}';\n`,
    );
  } else {
    magicString.prepend(
      `import { ${defaultAlias} } from '${defaultExport.specifier}';\n`,
    );
  }

  return exports.length > 0
    ? magicString
        .replace(
          defaultExport.code,
          `export = ${defaultAlias};\nexport { ${exports.join(", ")} } from '${defaultExport.specifier}'`,
        )
        .toString()
    : magicString
        .replace(defaultExport.code, `export = ${defaultAlias}`)
        .toString();
}

// export { xxx as default };
function handleNoSpecifierDefaultCJSExport(
  code: string,
  info: RenderedChunk,
  { defaultAlias, defaultExport, exports }: ParsedExports,
): string | undefined {
  let exportStatement = exports.length > 0 ? undefined : "";

  // replace export { type A, type B, type ... } with export type { A, B, ... }
  // that's, if all remaining exports are type exports, replace export {} with export type {}
  if (exportStatement === undefined) {
    let someExternalExport = false;
    const typeExportRegexp = /\s*type\s+/;
    const allRemainingExports = exports.map((exp) => {
      if (someExternalExport) {
        return [exp, ""] as const;
      }
      if (!info.imports.includes(exp)) {
        const m = exp.match(typeExportRegexp);
        if (m) {
          const name = exp.replace(m[0], "").trim();
          if (!info.imports.includes(name)) {
            return [exp, name] as const;
          }
        }
      }
      someExternalExport = true;
      return [exp, ""] as const;
    });
    exportStatement = someExternalExport
      ? `;\nexport { ${allRemainingExports.map(([e, _]) => e).join(", ")} }`
      : `;\nexport type { ${allRemainingExports.map(([_, t]) => t).join(", ")} }`;
  }

  return code.replace(
    defaultExport.code,
    `export = ${defaultAlias}${exportStatement}`,
  );
}

function pathDefaultCJSExportsPlugin(
  code: string,
  info: RenderedChunk,
  ctx: BuildContext,
): string | undefined {
  const parsedExports = extractExports(code, info, ctx);
  if (!parsedExports) {
    return;
  }

  if (parsedExports.defaultExport.specifier) {
    const imports: ParsedStaticImport[] = [];
    for (const imp of findStaticImports(code)) {
      // don't add empty imports like import 'pathe';
      if (!imp.imports) {
        continue;
      }
      imports.push(parseStaticImport(imp));
    }
    const specifier = parsedExports.defaultExport.specifier;
    const defaultImport = imports.find((i) => i.specifier === specifier);
    return parsedExports.defaultExport._type === "named"
      ? // export { resolve as default } from "pathe";
        // or (handleDefaultNamedCJSExport will call handleDefaultCJSExportAsDefault)
        // export { default } from "magic-string";
        handleDefaultNamedCJSExport(
          code,
          info,
          parsedExports,
          imports,
          ctx,
          defaultImport,
        )
      : // export { default } from "magic-string";
        // or
        // import MagicString from 'magic-string';
        // export default MagicString;
        handleDefaultCJSExportAsDefault(
          code,
          parsedExports,
          imports,
          defaultImport,
        );
  } else {
    // export { xxx as default };
    return handleNoSpecifierDefaultCJSExport(code, info, parsedExports);
  }
}

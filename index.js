const { android } = require("@raydeck/react-native-utilities");
const { join } = require("path");
const { sync: glob } = require("glob");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const fixMultidex = (path = process.cwd()) => {
  const appPath = android.getAppPath(path);
  const buildGradlePath = join(appPath, "build.gradle");
  if (!existsSync(buildGradlePath)) {
    throw "Could not find build.gradle at path";
  }
  const MainApplicationPath = glob(
    join(android.getMainPath(), "**", "MainApplication.java")
  ).pop();
  if (!MainApplicationPath) {
    throw (
      "Could not find MainApplication.java within " + android.getMainPath(path)
    );
  }
  //Edit build.gradle
  const newConfig = "multiDexEnabled true";
  const dependencies = `def multidex_version = "2.0.1"
implementation "androidx.multidex:multidex:$multidex_version"`;
  const buildGradleText = readFileSync(buildGradlePath, {
    encoding: "utf8",
  });
  const buildGradleLines = buildGradleText.split("\n");
  if (!buildGradleText.includes(newConfig)) {
    //add it
    const pos = buildGradleLines.findIndex((l) =>
      l.includes("targetSdkVersion")
    );
    buildGradleLines.splice(pos + 1, 0, newConfig);
  }
  if (!buildGradleText.includes(dependencies)) {
    const pos = buildGradleLines.findIndex((l) =>
      l.startsWith("dependencies {")
    );
    buildGradleLines.splice(pos + 1, 0, dependencies);
  }
  writeFileSync(buildGradlePath, buildGradleLines.join("\n"));
  const MainApplicationText = readFileSync(MainApplicationPath, {
    encoding: "utf8",
  });
  const MainApplicationLines = MainApplicationText.split("\n");
  const importLine = "import androidx.multidex.MultiDexApplication; ";
  const extendsText = "extends MultiDexApplication";
  const searchText = "extends Application";
  if (!MainApplicationText.includes(importLine))
    MainApplicationLines.splice(
      MainApplicationLines.findIndex((l) => l.includes("package")) + 1,
      0,
      importLine
    );
  let text = MainApplicationLines.join("\n");
  if (text.includes(searchText)) text = text.replace(searchText, extendsText);
  writeFileSync(MainApplicationPath, text);
};
module.exports = fixMultidex;

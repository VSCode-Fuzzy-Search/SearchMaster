const { reporters } = require('mocha');

module.exports = class MultiReporter extends reporters.Base {
	constructor(runner, options) {
		super(runner, options, [
			new reporters.Spec(runner, { reporterOptions: options.reporterOption?.specReporterOptions }),
			new reporters.JSON(runner, { reporterOptions: options.reporterOption?.jsonReporterOptions })
		]);
	}
};

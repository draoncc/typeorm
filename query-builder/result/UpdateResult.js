"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateResult = void 0;
/**
 * Result object returned by UpdateQueryBuilder execution.
 */
var UpdateResult = /** @class */ (function () {
    function UpdateResult() {
        /**
         * Contains inserted entity id.
         * Has entity-like structure (not just column database name and values).
         */
        // identifier: ObjectLiteral[] = [];
        /**
         * Generated values returned by a database.
         * Has entity-like structure (not just column database name and values).
         */
        this.generatedMaps = [];
    }
    UpdateResult.from = function (queryResult) {
        var result = new this();
        result.raw = queryResult.records;
        result.affected = queryResult.affected;
        return result;
    };
    return UpdateResult;
}());
exports.UpdateResult = UpdateResult;

//# sourceMappingURL=UpdateResult.js.map

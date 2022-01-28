"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteQueryBuilder = void 0;
var tslib_1 = require("tslib");
var CockroachDriver_1 = require("../driver/cockroachdb/CockroachDriver");
var QueryBuilder_1 = require("./QueryBuilder");
var SqlServerDriver_1 = require("../driver/sqlserver/SqlServerDriver");
var PostgresDriver_1 = require("../driver/postgres/PostgresDriver");
var DeleteResult_1 = require("./result/DeleteResult");
var ReturningStatementNotSupportedError_1 = require("../error/ReturningStatementNotSupportedError");
var EntitySchema_1 = require("../entity-schema/EntitySchema");
/**
 * Allows to build complex sql queries in a fashion way and execute those queries.
 */
var DeleteQueryBuilder = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(DeleteQueryBuilder, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function DeleteQueryBuilder(connectionOrQueryBuilder, queryRunner) {
        var _this = _super.call(this, connectionOrQueryBuilder, queryRunner) || this;
        _this.expressionMap.aliasNamePrefixingEnabled = false;
        return _this;
    }
    // -------------------------------------------------------------------------
    // Public Implemented Methods
    // -------------------------------------------------------------------------
    /**
     * Gets generated SQL query without parameters being replaced.
     */
    DeleteQueryBuilder.prototype.getQuery = function () {
        var sql = this.createComment();
        sql += this.createDeleteExpression();
        return sql.trim();
    };
    /**
     * Executes sql generated by query builder and returns raw database results.
     */
    DeleteQueryBuilder.prototype.execute = function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var _a, sql, parameters, queryRunner, transactionStartedByUs, queryResult, deleteResult, error_1, rollbackError_1;
            return (0, tslib_1.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, tslib_1.__read)(this.getQueryAndParameters(), 2), sql = _a[0], parameters = _a[1];
                        queryRunner = this.obtainQueryRunner();
                        transactionStartedByUs = false;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 11, 16, 19]);
                        if (!(this.expressionMap.useTransaction === true && queryRunner.isTransactionActive === false)) return [3 /*break*/, 3];
                        return [4 /*yield*/, queryRunner.startTransaction()];
                    case 2:
                        _b.sent();
                        transactionStartedByUs = true;
                        _b.label = 3;
                    case 3:
                        if (!(this.expressionMap.callListeners === true && this.expressionMap.mainAlias.hasMetadata)) return [3 /*break*/, 5];
                        return [4 /*yield*/, queryRunner.broadcaster.broadcast("BeforeRemove", this.expressionMap.mainAlias.metadata)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [4 /*yield*/, queryRunner.query(sql, parameters, true)];
                    case 6:
                        queryResult = _b.sent();
                        deleteResult = DeleteResult_1.DeleteResult.from(queryResult);
                        if (!(this.expressionMap.callListeners === true && this.expressionMap.mainAlias.hasMetadata)) return [3 /*break*/, 8];
                        return [4 /*yield*/, queryRunner.broadcaster.broadcast("AfterRemove", this.expressionMap.mainAlias.metadata)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        if (!transactionStartedByUs) return [3 /*break*/, 10];
                        return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [2 /*return*/, deleteResult];
                    case 11:
                        error_1 = _b.sent();
                        if (!transactionStartedByUs) return [3 /*break*/, 15];
                        _b.label = 12;
                    case 12:
                        _b.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, queryRunner.rollbackTransaction()];
                    case 13:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        rollbackError_1 = _b.sent();
                        return [3 /*break*/, 15];
                    case 15: throw error_1;
                    case 16:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 18];
                        return [4 /*yield*/, queryRunner.release()];
                    case 17:
                        _b.sent();
                        _b.label = 18;
                    case 18: return [7 /*endfinally*/];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Specifies FROM which entity's table select/update/delete will be executed.
     * Also sets a main string alias of the selection data.
     */
    DeleteQueryBuilder.prototype.from = function (entityTarget, aliasName) {
        entityTarget = entityTarget instanceof EntitySchema_1.EntitySchema ? entityTarget.options.name : entityTarget;
        var mainAlias = this.createFromAlias(entityTarget, aliasName);
        this.expressionMap.setMainAlias(mainAlias);
        return this;
    };
    /**
     * Sets WHERE condition in the query builder.
     * If you had previously WHERE expression defined,
     * calling this function will override previously set WHERE conditions.
     * Additionally you can add parameters used in where expression.
     */
    DeleteQueryBuilder.prototype.where = function (where, parameters) {
        this.expressionMap.wheres = []; // don't move this block below since computeWhereParameter can add where expressions
        var condition = this.getWhereCondition(where);
        if (condition)
            this.expressionMap.wheres = [{ type: "simple", condition: condition }];
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    DeleteQueryBuilder.prototype.andWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "and", condition: this.getWhereCondition(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new OR WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    DeleteQueryBuilder.prototype.orWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "or", condition: this.getWhereCondition(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     */
    DeleteQueryBuilder.prototype.whereInIds = function (ids) {
        return this.where(this.getWhereInIdsCondition(ids));
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     */
    DeleteQueryBuilder.prototype.andWhereInIds = function (ids) {
        return this.andWhere(this.getWhereInIdsCondition(ids));
    };
    /**
     * Adds new OR WHERE with conditions for the given ids.
     */
    DeleteQueryBuilder.prototype.orWhereInIds = function (ids) {
        return this.orWhere(this.getWhereInIdsCondition(ids));
    };
    /**
     * Optional returning/output clause.
     */
    DeleteQueryBuilder.prototype.output = function (output) {
        return this.returning(output);
    };
    /**
     * Optional returning/output clause.
     */
    DeleteQueryBuilder.prototype.returning = function (returning) {
        // not all databases support returning/output cause
        if (!this.connection.driver.isReturningSqlSupported())
            throw new ReturningStatementNotSupportedError_1.ReturningStatementNotSupportedError();
        this.expressionMap.returning = returning;
        return this;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates DELETE express used to perform query.
     */
    DeleteQueryBuilder.prototype.createDeleteExpression = function () {
        var tableName = this.getTableName(this.getMainTableName());
        var whereExpression = this.createWhereExpression();
        var returningExpression = this.createReturningExpression();
        if (returningExpression && (this.connection.driver instanceof PostgresDriver_1.PostgresDriver || this.connection.driver instanceof CockroachDriver_1.CockroachDriver)) {
            return "DELETE FROM " + tableName + whereExpression + " RETURNING " + returningExpression;
        }
        else if (returningExpression !== "" && this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver) {
            return "DELETE FROM " + tableName + " OUTPUT " + returningExpression + whereExpression;
        }
        else {
            return "DELETE FROM " + tableName + whereExpression;
        }
    };
    return DeleteQueryBuilder;
}(QueryBuilder_1.QueryBuilder));
exports.DeleteQueryBuilder = DeleteQueryBuilder;

//# sourceMappingURL=DeleteQueryBuilder.js.map

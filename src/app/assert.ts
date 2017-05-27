export class Assert {
    public static Fail(message?: string): void {
        if (message != null) {
            throw new Error(message);
        } else {
            throw new Error("Assertion fail called.");
        }
    }

    public static isTrue(condition: boolean, message?: string): void {
        if (!condition) {
            Assert.Fail(Assert.messageOrDefault(message, "Condition not true."));
        }
    }

    public static isFalse(condition: boolean, message?: string): void {
        Assert.isTrue(!condition, message);
    }

    public static areEqual<T>(a: T, b: T, message?: string): void {
        if (a != b) {
            Assert.Fail(Assert.messageOrDefault(message, `Arguments ${a} =/= ${b}`));
        }
    }

    public static failUnexpectedDefault<T>(value: T, message?: string): void {
        Assert.Fail(Assert.messageOrDefault(message, `Unexpected default value: ${value}`));
    }

    private static messageOrDefault(message: string, defaultMsg: string): string {
        return (message != null) ? message : defaultMsg;
    }
}
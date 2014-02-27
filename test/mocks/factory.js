var createMockFactory = function () {
    return {
        input: {
            text: identity,
            textarea: identity,
            select: identity,
            radio: identity,
            checkbox: identity,
            file: identity,
            button: identity
        }
    };
};
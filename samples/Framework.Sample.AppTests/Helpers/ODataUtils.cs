using System.Linq.Expressions;
using TCPOS.Common.Linq.Extensions;

namespace Framework.Sample.AppTests.Helpers;

internal static class ODataUtils
{
    private static string ExpressionToODataFilter(Expression expr)
    {
        var value = expr.EvaluateExpression();
        if (value.Success)
        {
            return ValueToOdata(value.Value);
        }

        return expr switch
        {
            BinaryExpression binaryExpression => ParseBinaryExpression(binaryExpression),
            MemberExpression memberExpression => ParseMemberExpression(memberExpression),
            ConstantExpression constantExpression => ParseConstantExpression(constantExpression),
            UnaryExpression unaryExpression => ParseUnaryExpression(unaryExpression),
            _ => throw new NotImplementedException()
        };
    }

    private static string ValueToOdata(object? expressionValue)
    {
        return expressionValue switch
        {
            null => "null",
            int i => i.ToString(System.Globalization.CultureInfo.InvariantCulture),
            double d => d.ToString(System.Globalization.CultureInfo.InvariantCulture),
            decimal dc => dc.ToString(System.Globalization.CultureInfo.InvariantCulture),
            string s => $"'{s.Replace("'", "''")}'",
            DateTime dt => dt.ToString("O"),
            bool b => b ? "true" : "false",
            _ => throw new NotImplementedException()
        };
    }

    private static string ParseConstantExpression(ConstantExpression constantExpression)
    {
        return constantExpression.Value switch
        {
            int i => $"{i}",
            decimal d => $"{d}",
            string s => $"'{s.Replace("'", "''")}'",
            bool b => $"{b.ToString().ToLowerInvariant()}",
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    private static string ParseMemberExpression(MemberExpression memberExpression)
    {
        return $"{memberExpression.Member.Name}";
    }

    private static string ParseUnaryExpression(UnaryExpression unaryExpression)
    {
        var expression = unaryExpression.EvaluateExpression();

        if (expression.Success)
        {
            return $"{expression.Value}";
        }

        throw expression.Exception!;
    }

    private static string ParseBinaryExpression(BinaryExpression binaryExpression)
    {
        var op = binaryExpression.NodeType switch
        {
            ExpressionType.Equal => "eq",
            ExpressionType.NotEqual => "ne",
            ExpressionType.GreaterThan => "gt",
            ExpressionType.GreaterThanOrEqual => "ge",
            ExpressionType.LessThan => "lt",
            ExpressionType.LessThanOrEqual => "le",
            ExpressionType.AndAlso => "and",
            ExpressionType.OrElse => "or",
            _ => throw new ArgumentOutOfRangeException()
        };
        return $"({ExpressionToODataFilter(binaryExpression.Left)} {op} {ExpressionToODataFilter(binaryExpression.Right)})";
    }

    internal static string ExpressionToODataFilter<T>(Expression<Func<T, bool>> expr)
    {
        return ExpressionToODataFilter(expr.Body);
    }
}
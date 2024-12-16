using System.Text.Json;
using System.Text.Json.Serialization;

namespace Framework.Sample.App.Utils
{
    public class StringToEnumConverter<TEnum> : JsonConverter<TEnum> where TEnum : struct
    {
        public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            string? enumString = reader.GetString();

            if (string.IsNullOrEmpty(enumString))
            {
                throw new JsonException($"Cannot convert empty string to {typeof(TEnum).Name}");
            }

            if (Enum.TryParse<TEnum>(enumString, true, out TEnum result))
            {
                return result;
            }

            throw new JsonException($"Invalid {typeof(TEnum).Name} value: {enumString}");
        }

        public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString());
        }
    }
}

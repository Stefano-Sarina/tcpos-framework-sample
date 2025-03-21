using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class UserGroupIn<T>
{
    [Required]
    public T UserId
    {
        get;
        set;
    }

    [Required]
    public T GroupId
    {
        get;
        set;
    }
}

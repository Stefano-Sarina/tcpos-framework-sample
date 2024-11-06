using System.ComponentModel.DataAnnotations;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class Product
{
    [PrimaryKeyField]
    public int Id
    {
        get;
        set;
    }

    [UniqueKeyField]
    [StringLength(40, MinimumLength = 1)]
    public string Name
    {
        get;
        set;
    }

    public decimal Price
    {
        get;
        set;
    }
}
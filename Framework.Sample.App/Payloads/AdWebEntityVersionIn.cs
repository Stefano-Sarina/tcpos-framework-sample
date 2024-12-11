using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class AdWebEntityVersionIn
{
    [Required]
    [StringLength(80)]
    [Comment("The entity identifier.")]
    public virtual string EntityName
    {
        get;
        set;
    } = string.Empty;

    [Column("version")]
    [Required]
    [StringLength(16)]
    [Comment("The entity version.")]
    public virtual string Version
    {
        get;
        set;
    } = string.Empty;
}

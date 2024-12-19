using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[Table("AdWebEntityVersions")]
public class AdWebEntityVersion: Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

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

using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities
{
    [Table("PermissionsDependencies")]
    public class PermissionDependency : Entity
    {
        [ConcurrencyItem]
        [PrimaryKeyField]
        public override int Id
        {
            get;
            set;
        }

        [ConcurrencyItem]
        [ForeignKey(nameof(Permission))]
        [UniqueKeyField("unk_childprm_parentprm")]
        public int ChildPermissionId
        {
            get;
            set;
        }

        [ForeignKeyOne(nameof(Permission.ChildPermissionDependencies), DeleteBehavior.Cascade, [nameof(ChildPermissionId)], null, false)]
        public Permission ChildPermission
        {
            get;
            set;
        }

        [ConcurrencyItem]
        [ForeignKey(nameof(Permission))]
        [UniqueKeyField("unk_childprm_parentprm")]
        public int ParentPermissionId
        {
            get;
            set;
        }

        [ForeignKeyOne(nameof(Permission.ParentPermissionDependencies), DeleteBehavior.NoAction, [nameof(ParentPermissionId)], null, false)]
        public Permission ParentPermission
        {
            get;
            set;
        }
    }
}

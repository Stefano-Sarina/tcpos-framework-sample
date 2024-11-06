using Framework.Sample.App.DB;
using Microsoft.EntityFrameworkCore.Storage;
using TCPOS.AspNetCore.DataBind.Interfaces;

namespace Framework.Sample.App.DataBind;

public class StorageProvider(DbContext dbContext) : IStorageProvider, IDisposable, IAsyncDisposable
{
    private IDbContextTransaction? _transaction;

    public async ValueTask DisposeAsync()
    {
        if (_transaction != null)
        {
            await RollbackTransaction();
            await _transaction.DisposeAsync();
        }
    }

    public void Dispose()
    {
        if (_transaction == null)
        {
            return;
        }

        _transaction.Rollback();
        _transaction.Dispose();
    }

    public async Task BeginTransaction()
    {
        _transaction = await dbContext.Database.BeginTransactionAsync();
    }

    public async Task CommitTransaction()
    {
        await (_transaction != null ? _transaction.CommitAsync() : Task.CompletedTask);
    }

    public async Task RollbackTransaction()
    {
        await (_transaction != null ? _transaction.RollbackAsync() : Task.CompletedTask);
    }

    public T GetStorage<T>()
    {
        return dbContext is T storage ? storage : throw new ArgumentNullException();
    }
}
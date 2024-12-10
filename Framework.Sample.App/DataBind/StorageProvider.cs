using Framework.Sample.App.DB;
using Microsoft.EntityFrameworkCore.Storage;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.DataBind;

public class StorageProvider(SampleDbContext dbContext) : IStorageProvider, IDisposable, IAsyncDisposable
{
    private IDbContextTransaction? _transaction;
    private bool _transactionInProgress;

    public async ValueTask DisposeAsync()
    {
        if (_transaction != null)
        {
            if (_transactionInProgress)
            {
                await RollbackTransaction();
            }

            await _transaction.DisposeAsync();
        }
    }

    public void Dispose()
    {
        if (_transaction == null)
        {
            return;
        }

        if (_transactionInProgress)
        {
            _transaction.Rollback();
        }

        _transaction.Dispose();
    }

    public async Task BeginTransaction()
    {
        _transaction = await dbContext.Database.BeginTransactionAsync();
        _transactionInProgress = true;
    }

    public async Task CommitTransaction()
    {
        await (_transaction != null ? _transaction.CommitAsync() : Task.CompletedTask);
        _transactionInProgress = false;
    }

    public async Task RollbackTransaction()
    {
        await (_transaction != null ? _transaction.RollbackAsync() : Task.CompletedTask);
        _transactionInProgress = false;
    }

    public T GetStorage<T>()
    {
        return dbContext is T storage ? storage : throw new ArgumentNullException();
    }
}

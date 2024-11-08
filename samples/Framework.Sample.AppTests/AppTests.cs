using System.Net;
using FluentAssertions;
using Framework.Sample.App.Payloads;
using Framework.Sample.AppTests.Helpers;
using TCPOS.AspNetCore.DataBind.Batch.Enums;
using TCPOS.AspNetCore.DataBind.Payloads;
using Xunit;

namespace Framework.Sample.AppTests;

public partial class AppTests : IDisposable, IAsyncDisposable
{
    [Fact]
    public async Task SimpleBatchShouldWork()
    {
        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", HttpStatusCode.OK);

        foreach (var customer in customers)
        {
            await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{customer.Id}", HttpStatusCode.OK);
        }

        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);
        });

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        customerIn = new CustomerIn
        {
            FirstName = "Mario",
            LastName = "Bianchi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{customers.First().Id}", customerIn, HttpStatusCode.Created);
        });

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{customers.First().Id}", customerIn, HttpStatusCode.Created);
        });

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", HttpStatusCode.OK);
        customers.Should().HaveCount(0);
    }

    [Fact]
    public async Task RouteReferenceShouldWork()
    {
        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        await _httpClient.RunBatch(2, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/10/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/20/Customer/{Operations.Remove}/{ValueReference.CreateReference(10).ToRouteValue()}", customerIn, HttpStatusCode.Created);
        });
    }

    [Fact]
    public async Task ComplexBatchShouldWork()
    {
        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", HttpStatusCode.OK);

        foreach (var customer in customers)
        {
            await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{customer.Id}", HttpStatusCode.OK);
        }

        var products = await _httpClient.ODataHttpGetAsync<ProductOut>("/api/1.0/Product", HttpStatusCode.OK);

        foreach (var productOut in products)
        {
            await _httpClient.HttpDeleteAsync($"/api/1.0/Product/{productOut.Id}", HttpStatusCode.OK);
        }

        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        var productIn = new ProductIn
        {
            Name = "Product 1",
            Price = 10.0m
        };
        var orderIn = new OrderIn<ValueReference>
        {
            CustomerId = ValueReference.CreateReference(0),
            Notes = null,
            OrderDate = DateOnly.FromDateTime(DateTime.Now)
        };
        var orderDetailIn = new OrderDetailIn<ValueReference>
        {
            OrderId = ValueReference.CreateReference(20),
            ProductId = ValueReference.CreateReference(10),
            Quantity = 5
        };
        await _httpClient.RunBatch(4, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/0/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);
            await _httpClient.HttpPostAsync<OrderIn<ValueReference>, string>($"/api/1.0/Batch/{batchId}/20/Order/{Operations.Insert}", orderIn, HttpStatusCode.Created);
            await _httpClient.HttpPostAsync<ProductIn, string>($"/api/1.0/Batch/{batchId}/10/Product/{Operations.Insert}", productIn, HttpStatusCode.Created);
            await _httpClient.HttpPostAsync<OrderDetailIn<ValueReference>, string>($"/api/1.0/Batch/{batchId}/30/OrderDetail/{Operations.Insert}", orderDetailIn, HttpStatusCode.Created);
        });
    }
}

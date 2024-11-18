using System.Net;
using FluentAssertions;
using Framework.Sample.App.Payloads;
using Framework.Sample.AppTests.Helpers;
using TCPOS.Common.Linq.Extensions;
using TCPOS.Data.Batches.Enums;
using TCPOS.Data.Batches.Payload;
using Xunit;

namespace Framework.Sample.AppTests;

public partial class AppTests : IDisposable, IAsyncDisposable
{
    [Fact]
    public async Task SimpleBatchShouldWork()
    {
        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", HttpStatusCode.OK);

        foreach (var customer in customers.ToEnumerableOrEmpty())
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

        foreach (var customer in customers.ToEnumerableOrEmpty())
        {
            await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{customer.Id}", HttpStatusCode.OK);
        }

        var products = await _httpClient.ODataHttpGetAsync<ProductOut>("/api/1.0/Product", HttpStatusCode.OK);

        foreach (var product in products.ToEnumerableOrEmpty())
        {
            await _httpClient.HttpDeleteAsync($"/api/1.0/Product/{product.Id}", HttpStatusCode.OK);
        }

        var productIn1 = new ProductIn
        {
            Name = "Product 1",
            Price = 10.0m
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<ProductIn, string>($"/api/1.0/Batch/{batchId}/10/Product/{Operations.Insert}", productIn1, HttpStatusCode.Created);
        });
        var productOut = (await _httpClient.ODataHttpGetAsync<ProductOut>("/api/1.0/Product", r => r.Name == productIn1.Name, HttpStatusCode.OK)).First();

        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        productIn1 = new ProductIn
        {
            Name = "Product 1",
            Price = 100.0m
        };
        var productIn2 = new ProductIn
        {
            Name = "Product 2",
            Price = 20.0m
        };
        var orderIn = new OrderIn<ValueReference>
        {
            CustomerId = ValueReference.CreateReference(20),
            Notes = null,
            OrderDate = DateOnly.FromDateTime(DateTime.Now)
        };
        var orderDetailIn1 = new OrderDetailIn<ValueReference>
        {
            OrderId = ValueReference.CreateReference(30),
            ProductId = ValueReference.CreateReference(10),
            Quantity = 5
        };
        var orderDetailIn2 = new OrderDetailIn<ValueReference>
        {
            OrderId = ValueReference.CreateReference(30),
            ProductId = ValueReference.CreateReference(40),
            Quantity = 10
        };
        await _httpClient.RunBatch(6, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<ProductIn, string>($"/api/1.0/Batch/{batchId}/10/Product/{Operations.Replace}/" + productOut.Id, productIn1, HttpStatusCode.Created);

            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/20/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);

            await _httpClient.HttpPostAsync<OrderIn<ValueReference>, string>($"/api/1.0/Batch/{batchId}/30/Order/{Operations.Insert}", orderIn, HttpStatusCode.Created);

            await _httpClient.HttpPostAsync<ProductIn, string>($"/api/1.0/Batch/{batchId}/40/Product/{Operations.Insert}", productIn2, HttpStatusCode.Created);

            await _httpClient.HttpPostAsync<OrderDetailIn<ValueReference>, string>($"/api/1.0/Batch/{batchId}/50/OrderDetail/{Operations.Insert}", orderDetailIn1, HttpStatusCode.Created);
            await _httpClient.HttpPostAsync<OrderDetailIn<ValueReference>, string>($"/api/1.0/Batch/{batchId}/60/OrderDetail/{Operations.Insert}", orderDetailIn2, HttpStatusCode.Created);
        });
    }
}

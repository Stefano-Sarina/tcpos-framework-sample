using System.Net;
using FluentAssertions;
using Framework.Sample.App.Payloads;
using Framework.Sample.AppTests.Helpers;
using Microsoft.AspNetCore.JsonPatch.Operations;
using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Common.Linq.Extensions;
using TCPOS.Data.Batches.Enums;
using TCPOS.Data.Batches.Payload;
using Xunit;

namespace Framework.Sample.AppTests;

public partial class AppTests
{
    [Fact]
    public async Task BatchConcurrencyShouldWork()
    {
        await RemoveAll<CustomerOut>("Customer");

        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        var id = await _httpClient.HttpPostAsync<CustomerIn, int>("/api/1.0/Customer/", customerIn, HttpStatusCode.Created);

        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        var concurrencyCode = customers.First().ConcurrencyCode;

        customerIn = new CustomerIn
        {
            FirstName = "Angelo",
            LastName = "Bianchi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{id}/wrong-code", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.Conflict);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{id}/{WebUtility.UrlEncode(concurrencyCode)}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{id}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        concurrencyCode = customers.First().ConcurrencyCode;

        var payload = new Operation<CustomerIn>
        {
            op = "replace",
            path = "/FirstName",
            value = "Mario"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Update}/{id}/wrong-code", new[] { payload }, HttpStatusCode.Created);
        }, HttpStatusCode.Conflict);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.value && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Update}/{id}/{WebUtility.UrlEncode(concurrencyCode)}", new[] { payload }, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.value && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        payload = new Operation<CustomerIn>
        {
            op = "replace",
            path = "/FirstName",
            value = "Dario"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Update}/{id}", new[] { payload }, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.value && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        concurrencyCode = customers.First().ConcurrencyCode;

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{id}/wrong-code", HttpStatusCode.Created);
        }, HttpStatusCode.Conflict);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{id}/{WebUtility.UrlEncode(concurrencyCode)}", HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        id = await _httpClient.HttpPostAsync<CustomerIn, int>("/api/1.0/Customer/", customerIn, HttpStatusCode.Created);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{id}", HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);
    }

    [Fact]
    public async Task ErpConcurrencyShouldWork()
    {
        await RemoveAll<CustomerOut>("Customer");

        // Create a new customer
        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        var id = await _httpClient.HttpPostAsync<CustomerIn, int>("/api/1.0/Customer/", customerIn, HttpStatusCode.Created);

        // Verify the customer was created
        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        var concurrencyCode = customers.First().ConcurrencyCode;

        // Attempt to update the customer with a wrong concurrency code
        customerIn = new CustomerIn
        {
            FirstName = "Angelo",
            LastName = "Bianchi"
        };
        await _httpClient.HttpPutAsync($"/api/1.0/Customer/{id}/wrong-code", customerIn, HttpStatusCode.Conflict);

        // Verify the update failed
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        // Update the customer with the correct concurrency code
        await _httpClient.HttpPutAsync($"/api/1.0/Customer/{id}/{WebUtility.UrlEncode(concurrencyCode)}", customerIn, HttpStatusCode.OK);

        // Verify the update succeeded
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Update the customer without concurrency code
        customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        await _httpClient.HttpPutAsync($"/api/1.0/Customer/{id}", customerIn, HttpStatusCode.OK);

        // Verify the update succeeded
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        concurrencyCode = customers.First().ConcurrencyCode;

        // Attempt to patch the customer with a wrong concurrency code
        var payload = new Operation<CustomerIn>
        {
            op = "replace",
            path = "/FirstName",
            value = "Mario"
        };
        await _httpClient.HttpPatchAsync($"/api/1.0/Customer/{id}/wrong-code", new[] { payload }, HttpStatusCode.Conflict);

        // Verify the patch failed
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.value && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        // Patch the customer with the correct concurrency code
        await _httpClient.HttpPatchAsync($"/api/1.0/Customer/{id}/{WebUtility.UrlEncode(concurrencyCode)}", new[] { payload }, HttpStatusCode.OK);

        // Verify the patch succeeded
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.value && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Patch the customer without concurrency code
        payload = new Operation<CustomerIn>
        {
            op = "replace",
            path = "/FirstName",
            value = "Dario"
        };
        await _httpClient.HttpPatchAsync($"/api/1.0/Customer/{id}", new[] { payload }, HttpStatusCode.OK);

        // Verify the patch succeeded
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.value && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        concurrencyCode = customers.First().ConcurrencyCode;

        // Attempt to delete the customer with a wrong concurrency code
        await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{id}/wrong-code", HttpStatusCode.Conflict);

        // Verify the delete failed
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Delete the customer with the correct concurrency code
        await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{id}/{WebUtility.UrlEncode(concurrencyCode)}", HttpStatusCode.OK);

        // Verify the delete succeeded
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        // Create a new customer again
        customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        id = await _httpClient.HttpPostAsync<CustomerIn, int>("/api/1.0/Customer/", customerIn, HttpStatusCode.Created);

        // Verify the customer was created
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Delete the customer without concurrency code
        await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{id}", HttpStatusCode.OK);

        // Verify the customer was deleted
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);
    }

    private async Task RemoveAll<T>(string entityName)
        where T:IDEntity
    {
        var entities = await _httpClient.ODataHttpGetAsync<T>($"/api/1.0/{entityName}", HttpStatusCode.OK);
        foreach (var entity in entities.ToEnumerableOrEmpty())
        {
            await _httpClient.HttpDeleteAsync($"/api/1.0/{entityName}/{entity.Id}", HttpStatusCode.OK);
        }
    }

    [Fact]
    public async Task BatchShouldWork()
    {
        await RemoveAll<CustomerOut>("Customer");

        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);
        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        var id = customers.First().Id;

        var payload = new Operation<CustomerIn>
        {
            op = "replace",
            path = "/FirstName",
            value = "Mario"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Update}/{id}", new[] { payload }, HttpStatusCode.Created);
        }, HttpStatusCode.OK);
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.value && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        customerIn = new CustomerIn
        {
            FirstName = "Angelo",
            LastName = "Bianchi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{id}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{id}", HttpStatusCode.Created);
        }, HttpStatusCode.OK);
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);
    }

    [Fact]
    public async Task ErpShouldWork()
    {
        await RemoveAll<CustomerOut>("Customer");

        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        var id = await _httpClient.HttpPostAsync<CustomerIn, int>("/api/1.0/Customer/", customerIn, HttpStatusCode.Created);
        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        var payload = new Operation<CustomerIn>
        {
            op = "replace",
            path = "/FirstName",
            value = "Mario"
        };
        await _httpClient.HttpPatchAsync($"/api/1.0/Customer/{id}", new[] { payload }, HttpStatusCode.OK);
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.value && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        customerIn = new CustomerIn
        {
            FirstName = "Angelo",
            LastName = "Bianchi"
        };
        await _httpClient.HttpPutAsync($"/api/1.0/Customer/{id}", customerIn, HttpStatusCode.OK);
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{id}", HttpStatusCode.OK);
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);
    }

    [Fact]
    public async Task SimpleBatchShouldWork()
    {
        await RemoveAll<CustomerOut>("Customer");

        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        customerIn = new CustomerIn
        {
            FirstName = "Mario",
            LastName = "Bianchi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{customers.First().Id}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{customers.First().Id}", HttpStatusCode.Created);
        }, HttpStatusCode.OK);

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
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/10/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/20/Customer/{Operations.Remove}/{ValueReference.CreateReference(10).ToRouteValue()}", HttpStatusCode.Created);
        }, HttpStatusCode.OK);
    }

    [Fact]
    public async Task ComplexBatchShouldWork()
    {
        await RemoveAll<CustomerOut>("Customer");

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
        }, HttpStatusCode.OK);
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
        }, HttpStatusCode.OK);
    }
}

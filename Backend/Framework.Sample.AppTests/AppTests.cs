using System.Net;
using FluentAssertions;
using Framework.Sample.App.Payloads;
using Framework.Sample.AppTests.Helpers;
using Json.Patch;
using Json.Pointer;
using TCPOS.Lib.Common.Linq.Extensions;
using TCPOS.Lib.Data.Batches.Enums;
using TCPOS.Lib.Data.Batches.Payload;
using Xunit;

namespace Framework.Sample.AppTests;

public partial class AppTests
{
    [Fact]
    public async Task BatchConcurrencyShouldWork()
    {
        // Remove all existing customers
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
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{id}/wrong-code", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.Conflict);

        // Verify the customer was not updated
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        // Update the customer with the correct concurrency code
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{id}/{WebUtility.UrlEncode(concurrencyCode)}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer was updated
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Revert the customer to the original state
        customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{id}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer was reverted
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        concurrencyCode = customers.First().ConcurrencyCode;

        // Attempt to update the customer's first name with a wrong concurrency code
        var payload = PatchOperation.Replace(JsonPointer.Parse("/FirstName"), "Mario");
        await _httpClient.RunBatch(1, 900000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Update}/{id}/wrong-code", new[] { payload }, HttpStatusCode.Created);
        }, HttpStatusCode.Conflict);

        // Verify the customer's first name was not updated
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.Value! && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        // Update the customer's first name with the correct concurrency code
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Update}/{id}/{WebUtility.UrlEncode(concurrencyCode)}", new[] { payload }, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer's first name was updated
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.Value! && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Revert the customer's first name to the original state
        payload = PatchOperation.Replace(JsonPointer.Parse("/FirstName"), "Dario");
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Update}/{id}", new[] { payload }, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer's first name was reverted
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.Value! && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        concurrencyCode = customers.First().ConcurrencyCode;

        // Attempt to remove the customer with a wrong concurrency code
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{id}/wrong-code", HttpStatusCode.Created);
        }, HttpStatusCode.Conflict);

        // Verify the customer was not removed
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Remove the customer with the correct concurrency code
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{id}/{WebUtility.UrlEncode(concurrencyCode)}", HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer was removed
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        // Create the customer again
        customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        id = await _httpClient.HttpPostAsync<CustomerIn, int>("/api/1.0/Customer/", customerIn, HttpStatusCode.Created);

        // Verify the customer was created
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Remove the customer
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{id}", HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer was removed
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
        var payload = PatchOperation.Replace(JsonPointer.Parse("/FirstName"), "Mario");
        await _httpClient.HttpPatchAsync($"/api/1.0/Customer/{id}/wrong-code", new[] { payload }, HttpStatusCode.Conflict);

        // Verify the patch failed
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.Value! && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);

        // Patch the customer with the correct concurrency code
        await _httpClient.HttpPatchAsync($"/api/1.0/Customer/{id}/{WebUtility.UrlEncode(concurrencyCode)}", new[] { payload }, HttpStatusCode.OK);

        // Verify the patch succeeded
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.Value! && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Patch the customer without concurrency code
        payload = PatchOperation.Replace(JsonPointer.Parse("/FirstName"), "Dario");
        await _httpClient.HttpPatchAsync($"/api/1.0/Customer/{id}", new[] { payload }, HttpStatusCode.OK);

        // Verify the patch succeeded
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.Value! && v.LastName == customerIn.LastName, HttpStatusCode.OK);
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

    [Fact]
    public async Task BatchShouldWork()
    {
        // Remove all existing customers
        await RemoveAll<CustomerOut>("Customer");

        // Create a new customer
        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };

        // Insert the new customer in a batch operation
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer was inserted
        var customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);
        var id = customers.First().Id;

        // Prepare a payload to update the customer's first name
        var payload = PatchOperation.Replace(JsonPointer.Parse("/FirstName"), "Mario");

        // Update the customer's first name in a batch operation
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Update}/{id}", new[] { payload }, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer's first name was updated
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.Value! && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Create another customer
        customerIn = new CustomerIn
        {
            FirstName = "Angelo",
            LastName = "Bianchi"
        };

        // Replace the existing customer with the new customer in a batch operation
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Replace}/{id}", customerIn, HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer was replaced
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Remove the customer in a batch operation
        await _httpClient.RunBatch(1, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/1/Customer/{Operations.Remove}/{id}", HttpStatusCode.Created);
        }, HttpStatusCode.OK);

        // Verify the customer was removed
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(0);
    }

    [Fact]
    public async Task ErpShouldWork()
    {
        // Remove all existing customers
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

        // Update the customer's first name
        var payload = PatchOperation.Replace(JsonPointer.Parse("/FirstName"), "Mario");
        await _httpClient.HttpPatchAsync($"/api/1.0/Customer/{id}", new[] { payload }, HttpStatusCode.OK);

        // Verify the customer's first name was updated
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == (string)payload.Value! && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Replace the customer with a new one
        customerIn = new CustomerIn
        {
            FirstName = "Angelo",
            LastName = "Bianchi"
        };
        await _httpClient.HttpPutAsync($"/api/1.0/Customer/{id}", customerIn, HttpStatusCode.OK);

        // Verify the customer was replaced
        customers = await _httpClient.ODataHttpGetAsync<CustomerOut>("/api/1.0/Customer", v => v.FirstName == customerIn.FirstName && v.LastName == customerIn.LastName, HttpStatusCode.OK);
        customers.Should().HaveCount(1);

        // Delete the customer
        await _httpClient.HttpDeleteAsync($"/api/1.0/Customer/{id}", HttpStatusCode.OK);

        // Verify the customer was deleted
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
        await RemoveAll<CustomerOut>("Customer");

        var customerIn = new CustomerIn
        {
            FirstName = "Dario",
            LastName = "Rossi"
        };
        await _httpClient.RunBatch(2, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/10/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);
            await _httpClient.HttpPostAsync($"/api/1.0/Batch/{batchId}/20/Customer/{Operations.Remove}/{ValueReference<int>.CreateReference(10).ToRouteValue()}", HttpStatusCode.Created);
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
        var orderIn = new OrderIn<ValueReference<int>>
        {
            CustomerId = ValueReference<int>.CreateReference(20),
            Notes = null,
            OrderDate = DateOnly.FromDateTime(DateTime.Now)
        };
        var orderDetailIn1 = new OrderDetailIn<ValueReference<int>>
        {
            OrderId = ValueReference<int>.CreateReference(30),
            ProductId = ValueReference<int>.CreateReference(10),
            Quantity = 5
        };
        var orderDetailIn2 = new OrderDetailIn<ValueReference<int>>
        {
            OrderId = ValueReference<int>.CreateReference(30),
            ProductId = ValueReference<int>.CreateReference(40),
            Quantity = 10
        };
        await _httpClient.RunBatch(6, 20000, async batchId =>
        {
            await _httpClient.HttpPostAsync<ProductIn, string>($"/api/1.0/Batch/{batchId}/10/Product/{Operations.Replace}/" + productOut.Id, productIn1, HttpStatusCode.Created);

            await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/20/Customer/{Operations.Insert}", customerIn, HttpStatusCode.Created);

            await _httpClient.HttpPostAsync<OrderIn<ValueReference<int>>, string>($"/api/1.0/Batch/{batchId}/30/Order/{Operations.Insert}", orderIn, HttpStatusCode.Created);

            await _httpClient.HttpPostAsync<ProductIn, string>($"/api/1.0/Batch/{batchId}/40/Product/{Operations.Insert}", productIn2, HttpStatusCode.Created);

            await _httpClient.HttpPostAsync<OrderDetailIn<ValueReference<int>>, string>($"/api/1.0/Batch/{batchId}/50/OrderDetail/{Operations.Insert}", orderDetailIn1, HttpStatusCode.Created);
            await _httpClient.HttpPostAsync<OrderDetailIn<ValueReference<int>>, string>($"/api/1.0/Batch/{batchId}/60/OrderDetail/{Operations.Insert}", orderDetailIn2, HttpStatusCode.Created);
        }, HttpStatusCode.OK);
    }
}

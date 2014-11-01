using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Core.Persistence;
using Umbraco.Core.Persistence.DatabaseAnnotations;
using Umbraco.Web.WebApi;

namespace Fredrikshof.Controllers.ApiControllers
{
    [TableName("sampleTableOrder")]
    [PrimaryKey("Id", autoIncrement = true)]
    public class sampleTableOrder
    {
        [PrimaryKeyColumn(AutoIncrement = true)]
        public int Id { get; set; }
        public DateTime? RegDate { get; set; }
        public string CustomerId { get; set; }
        public string OrderStatus { get; set; }
    }

    public class CustomDataCreateDatabase : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            //Get the Umbraco Database context
            var db = applicationContext.DatabaseContext.Database;

            //Check if the DB table does NOT exist
            if (!db.TableExist("sampleTableOrder"))
            {
                //Create DB table - and set overwrite to false
                db.CreateTable<sampleTableOrder>(false);
            }

        }
    }
    [IsBackOffice]
    public class CustomDataController : UmbracoApiController
    {
        private Database db;
        public CustomDataController()
        {
            db = ApplicationContext.DatabaseContext.Database;
        }

        public object GetOrder(int Id)
        {
            return db.FirstOrDefault<sampleTableOrder>("SELECT TOP 1 * FROM sampleTableOrder WHERE Id=@0", Id);
        }
        public object GetOrders()
        {
            return db.Fetch<sampleTableOrder>("SELECT * FROM sampleTableOrder");
        }
        public object PostOrder(sampleTableOrder order)
        {
            db.Insert(order);
            return true;
        }
    }
}

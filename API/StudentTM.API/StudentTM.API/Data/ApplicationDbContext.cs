using Microsoft.EntityFrameworkCore;
using StudentTM.API.Models.Domain;
using System.Collections.Generic;

namespace StudentTM.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<TaskItem> TaskItems { get; set; }
    }
}